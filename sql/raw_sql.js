const SQL = {
  'GET.CLASSROOMS': `select
  students_result.cid as id,
  coaches_result.cname as name,
  coaches_result.description,
  coaches_result.created_at,
  coaches_result.is_active,
  coaches_result.coaches,
  students_result.students as student_count
from
  (
    SELECT
      ms.classroom_id as cid,
      count(ms.student_id) as students
    from
      mapping_student_classroom as ms
    group by
      ms.classroom_id
  ) students_result
  INNER JOIN (
    select
      classroom.id as cid,
      classroom.name as cname,
      classroom.description as description,
      classroom.is_active,
      classroom.created_at,
      GROUP_CONCAT(p.fullname) as coaches
    from
      classroom
      LEFT JOIN mapping_coach_classroom as mc ON classroom.id = mc.classroom_id,
      profile as p
    where
      coach_id = p.auth_id
    group by
      classroom.id
  ) AS coaches_result ON students_result.cid = coaches_result.cid;`,

  'GET.STUDENTS': `select authentication.id,authentication.email,authentication.user_type,profile.fullname 
    from authentication, profile
    where
        (authentication.id = profile.auth_id)
        and authentication.user_type = "student";`,

  'GET.COACHES': `select authentication.id,authentication.email,authentication.user_type,profile.fullname 
  from authentication, profile
  where 
  (authentication.id = profile.auth_id) 
  and authentication.user_type = "coach";`,

  'GET.USERS': `select
  profile.fullname,
  authentication.id,
  authentication.user_type,
  authentication.email
  from
  authentication,
  profile
  where
  authentication.id = profile.auth_id and
  (authentication.user_type = 'coach' or authentication.user_type = 'student');`
};

exports.SQL = SQL;
