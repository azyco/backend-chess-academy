function sqlGenerateInsertStudentsToClassRoom(classroomId, selectedStudentArray) {
  let sql = `insert into mapping_student_classroom(
    student_id,
    classroom_id,
    created_at)
    values`;
  selectedStudentArray.forEach((value) => {
    sql = sql.concat(`(${value.id},${classroomId},unix_timestamp(utc_timestamp())*1000),`);
  });
  return sql.slice(0, sql.length - 1).concat(';');
}

function sqlGenerateInsertCoachesToClassRoom(classroomId, selectedCoachArray) {
  let sql = `insert into mapping_coach_classroom(
        coach_id,
        classroom_id,
        created_at)
        values`;
  selectedCoachArray.forEach((value) => {
    sql = sql.concat(`(${value.id}, ${classroomId},unix_timestamp(utc_timestamp())*1000),`);
  });
  return sql.slice(0, sql.length - 1).concat(';');
}

function sqlGenerateInsertToProfile(config, profile) {
  return {
    sql: `insert into profile(
            auth_id,
            fullname,
            country,
            state,
            city,
            address,
            pincode,
            description,
            user_image,
            fide_id,
            contact,
            alt_contact,
            contact_code,
            alt_contact_code,
            lichess_id,
            dob,
            parent,
            is_private_contact,
            is_private_alt_contact,
            is_private_dob,
            is_private_parent
            ) 
            values(
                ${profile.id},
                '${profile.fullname}',
                '${profile.country}',
                '${profile.state}',
                '${profile.city}',
                '${profile.address}',
                '${profile.pincode}',
                '${profile.description}',
                '${profile.user_image}',
                '${profile.fide_id}',
                '${profile.contact}',
                '${profile.alt_contact}',
                '${profile.contact_code}',
                '${profile.alt_contact_code}',
                '${profile.lichess_id}',
                STR_TO_DATE('${profile.dob}', '%Y-%m-%d'),
                '${profile.parent}',
                ${profile.is_private_contact},
                ${profile.is_private_alt_contact},
                ${profile.is_private_dob},
                ${profile.is_private_parent}
                );`,
    timeout: config.db.queryTimeout,
  };
}

function sqlGenerateInsertToCoachExtras(config, profile) {
  return {
    sql: `insert into coach_extras(
      coach_id,
      fide_title,
      peak_rating,
      current_rating,
      perf_highlights,
      exp_trainer,
      successful_students,
      fees,
      bank_details
    )
    values(
      ${profile.id},
      '${profile.fide_title}',
      '${profile.peak_rating}',
      '${profile.current_rating}',
      '${profile.perf_highlights}',
      '${profile.exp_trainer}',
      '${profile.successful_students}',
      '${profile.fees}',
      '${profile.bank_details}'
    );
    `,
    timeout: config.db.queryTimeout,
  };
}


function sqlGenerateGetProfile(config, id) {
  return {
    sql: `select
        fullname,
        country,
        state,
        city,
        address,
        pincode,
        description,
        user_image,
        fide_id,
        contact,
        alt_contact,
        contact_code,
        alt_contact_code,
        lichess_id,
        dob,
        parent,
        is_private_contact,
        is_private_alt_contact,
        is_private_dob,
        is_private_parent
        from profile
        where auth_id = ${id};`,
    timeout: config.db.queryTimeout,
  };
}

function sqlGenerateGetCoachExtras(config, id) {
  return {
    sql: `select
          coach_id,
          fide_title,
          peak_rating,
          current_rating,
          perf_highlights,
          exp_trainer,
          successful_students,
          fees,
          bank_details
          from
          coach_extras
          where
          coach_id = ${id};`,
    timeout: config.db.queryTimeout,
  };
}

module.exports = {
  sqlGenerateGetProfile,
  sqlGenerateInsertToProfile,
  sqlGenerateInsertStudentsToClassRoom,
  sqlGenerateInsertCoachesToClassRoom,
  sqlGenerateInsertToCoachExtras,
  sqlGenerateGetCoachExtras,
};
