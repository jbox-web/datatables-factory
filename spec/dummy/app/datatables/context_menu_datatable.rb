# frozen_string_literal: true

class ContextMenuDatatable < AjaxDatatablesRails::ActiveRecord

  def view_columns
    @view_columns ||= {
      check_box:  { source: 'User.id',         orderable: false, searchable: false },
      first_name: { source: 'User.first_name',  cond: :string_eq },
      last_name:  { source: 'User.last_name',   cond: :string_eq },
      email:      { source: 'User.email',        cond: :string_eq },
      role:       { source: 'User.role',         searchable: false },
    }
  end

  def data
    records.map do |user|
      {
        check_box:  '',
        first_name: user.first_name,
        last_name:  user.last_name,
        email:      user.email,
        role:       user.role.to_s.capitalize,
        DT_RowId:   "user-#{user.id}",
      }
    end
  end

  def get_raw_records
    User.all
  end
end
