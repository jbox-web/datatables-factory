# frozen_string_literal: true

class BasicDatatable < AjaxDatatablesRails::ActiveRecord

  def view_columns
    @view_columns ||= {
      first_name: { source: 'User.first_name', cond: :string_eq },
      last_name:  { source: 'User.last_name',  cond: :string_eq },
      email:      { source: 'User.email',       cond: :string_eq },
      role:       { source: 'User.role',        cond: :string_eq, searchable: false },
      age:        { source: 'User.age',         cond: :string_eq, searchable: false },
      created_at: { source: 'User.created_at',  cond: :string_eq, searchable: false },
    }
  end

  def data
    records.map do |user|
      {
        first_name: user.first_name,
        last_name:  user.last_name,
        email:      user.email,
        role:       user.role.to_s.capitalize,
        age:        user.age,
        created_at: user.created_at.strftime('%d/%m/%Y'),
      }
    end
  end

  def get_raw_records
    User.all
  end
end
