const SQL = {
'GET.CLASSROOMS': `select classroom.id, classroom.name, classroom.description,
    classroom.is_active, classroom.created_at, count(ms.student_id) as student_count, group_concat(p.fullname) as coaches
    from
        classroom,
        mapping_student_classroom as ms,
        mapping_coach_classroom as mc,
        profile as p
    where
        classroom.id = ms.classroom_id AND
        classroom.id = mc.classroom_id AND
        mc.coach_id = p.auth_id
    group by
        classroom.id,
        mc.coach_id;`,
'GET.STUDENTS': `select authentication.id,authentication.email,authentication.user_type,profile.fullname 
    from authentication, profile
    where
        (authentication.id = profile.auth_id)
        and authentication.user_type = "student";`
};

exports.SQL = SQL;
