CREATE OR REPLACE FUNCTION labmanager.enroll_user_in_lab(
  p_auth_id UUID,
  p_lab_id INT
)
RETURNS JSON
LANGUAGE plpgsql AS $$
DECLARE
  v_user_id INT;
  v_max_capacity INT;
  v_lab_status BOOLEAN;
  v_active_count INT;
  result JSON;
BEGIN

  SELECT id INTO v_user_id
  FROM labmanager.users
  WHERE auth_id = p_auth_id AND status = TRUE;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario nao encontrado ou inativo.';
  END IF;


  SELECT max_capacity, status INTO v_max_capacity, v_lab_status
  FROM labmanager.laboratory
  WHERE id = p_lab_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Laboratorio nao encontrado.';
  END IF;


  IF v_lab_status = FALSE THEN
    RAISE EXCEPTION 'Laboratorio inativo.';
  END IF;


  IF EXISTS (
    SELECT 1 FROM labmanager.ticket
    WHERE fk_user_id = v_user_id
      AND fk_laboratory_id = p_lab_id
      AND status = TRUE
  ) THEN
    RAISE EXCEPTION 'Usuario ja possui vinculo ativo neste laboratorio.';
  END IF;


  SELECT COUNT(*) INTO v_active_count
  FROM labmanager.ticket
  WHERE fk_laboratory_id = p_lab_id AND status = TRUE;

  IF v_active_count >= v_max_capacity THEN
    RAISE EXCEPTION 'Capacidade maxima atingida.';
  END IF;


  INSERT INTO labmanager.access_history (fk_laboratory_id, fk_user_id, entry_time, access_date)
  VALUES (p_lab_id, v_user_id, LOCALTIME, CURRENT_DATE);


  INSERT INTO labmanager.ticket (fk_user_id, fk_laboratory_id, status)
  VALUES (v_user_id, p_lab_id, TRUE)
  RETURNING row_to_json(ticket.*) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION labmanager.checkout_user_from_lab(
  p_auth_id UUID,
  p_lab_id INT
)
RETURNS JSON
LANGUAGE plpgsql AS $$
DECLARE
  v_user_id INT;
  v_ticket_id INT;
  result JSON;
BEGIN
  SELECT id INTO v_user_id
  FROM labmanager.users
  WHERE auth_id = p_auth_id AND status = TRUE;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario nao encontrado ou inativo.';
  END IF;


  SELECT id INTO v_ticket_id
  FROM labmanager.ticket
  WHERE fk_user_id = v_user_id
    AND fk_laboratory_id = p_lab_id
    AND status = TRUE
  FOR UPDATE;

  IF v_ticket_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum vinculo ativo encontrado para este laboratorio.';
  END IF;


  UPDATE labmanager.ticket
  SET status = FALSE, departure_date = now()
  WHERE id = v_ticket_id
  RETURNING row_to_json(ticket.*) INTO result;

  
  UPDATE labmanager.access_history
  SET departure_time = LOCALTIME
  WHERE id = (
    SELECT id FROM labmanager.access_history
    WHERE fk_user_id = v_user_id
      AND fk_laboratory_id = p_lab_id
      AND departure_time IS NULL
    ORDER BY id DESC
    LIMIT 1
  );

  RETURN result;
END;
$$;
