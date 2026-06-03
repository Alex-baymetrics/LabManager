DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uk_daily_history_lab_date'
  ) THEN
    ALTER TABLE labmanager.daily_history
    ADD CONSTRAINT uk_daily_history_lab_date
    UNIQUE (fk_laboratory_id, report_date);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION labmanager.generate_daily_history()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO labmanager.daily_history (
    fk_laboratory_id,
    access_quantity,
    report_date,
    average_stay_minutes
  )
  SELECT
    ah.fk_laboratory_id,
    COUNT(*) AS access_quantity,
    ah.access_date AS report_date,
    COALESCE(
      AVG(
        EXTRACT(
          EPOCH FROM (ah.departure_time - ah.entry_time)
        ) / 60
      ),
      0
    ) AS average_stay_minutes
  FROM labmanager.access_history ah
  WHERE ah.access_date = CURRENT_DATE - INTERVAL '1 day'
    AND ah.departure_time IS NOT NULL
  GROUP BY ah.fk_laboratory_id, ah.access_date
  ON CONFLICT (fk_laboratory_id, report_date)
  DO UPDATE SET
    access_quantity = EXCLUDED.access_quantity,
    average_stay_minutes = EXCLUDED.average_stay_minutes;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_cron'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM cron.job
      WHERE jobname = 'gerar_historico_diario_laboratorios'
    ) THEN
      PERFORM cron.unschedule('gerar_historico_diario_laboratorios');
    END IF;
  ELSE
    RAISE NOTICE 'Extensao pg_cron nao habilitada; agendamento ignorado.';
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'gerar_historico_diario_laboratorios',
      '5 0 * * *',
      $cron$
        SELECT labmanager.generate_daily_history();
      $cron$
    );
  ELSE
    RAISE NOTICE 'Extensao pg_cron nao habilitada; schedule ignorado.';
  END IF;
END;
$$;
