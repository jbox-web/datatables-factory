# frozen_string_literal: true

class DefaultsDatatable < AjaxDatatablesRails::ActiveRecord

  def view_columns
    @view_columns ||= {
      first_name: { source: 'User.first_name', cond: :string_eq },
      last_name:  { source: 'User.last_name',  cond: :string_eq },
      email:      { source: 'User.email',      cond: :string_eq },
      # Same '|' contract as the bulk page: a multi_select default arrives as an
      # Array on the Ruby side and as a joined string on the wire.
      role:       { source: 'User.role', searchable: true, cond: lambda { |_col, term|
        keys = term.to_s.split('|').select { |k| User.roles.key?(k) }
        next if keys.empty?

        User.arel_table[:role].in(keys.map { |k| User.roles[k] })
      } },
    }
  end

  def data
    records.map do |user|
      {
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

  # column_id 3 = role
  def as_json(options = {})
    super.merge(
      dt_filter_data_3: User.roles.keys.map { |role| { value: role, label: role.capitalize } }
    )
  end

end
