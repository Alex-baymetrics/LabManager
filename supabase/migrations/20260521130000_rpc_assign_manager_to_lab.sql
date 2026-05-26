CREATE OR REPLACE FUNCTION labmanager.assign_manager_to_lab(
  p_lab_id INT,
  p_user_id INT
)
RETURNS JSON
LANGUAGE plpgsql AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM labmanager.users
    WHERE id = p_user_id
    AND user_type IN ('admin', 'colaborador')
    AND status = TRUE
  ) THEN
    RAISE EXCEPTION 'Usuario invalido ou sem permissao.';
  END IF;

  UPDATE labmanager.laboratory
  SET fk_user_manager_id = p_user_id
  WHERE id = p_lab_id
  RETURNING row_to_json(laboratory.*) INTO result;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Laboratorio nao encontrado.';
  END IF;

  RETURN result;
END;
$$;
