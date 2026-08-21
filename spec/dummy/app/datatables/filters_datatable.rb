# frozen_string_literal: true

class FiltersDatatable < AjaxDatatablesRails::ActiveRecord

  def view_columns
    @view_columns ||= {
      first_name: { source: 'User.first_name', cond: :string_eq },
      last_name:  { source: 'User.last_name',  cond: :string_eq },
      email:      { source: 'User.email',       cond: :string_eq },
      role:       { source: 'User.role',        cond: :string_eq, searchable: true },
      age:        { source: 'User.age', searchable: true, cond: lambda { |_col, term|
        next if term.exclude?('-dtf_delim-')
        min, max = term.split('-dtf_delim-')
        col = User.arel_table[:age]
        conds = []
        conds << col.gteq(min.to_i) if min.present?
        conds << col.lteq(max.to_i) if max.present?
        conds.reduce { |a, b| a.and(b) }
      } },
      created_at: { source: 'User.created_at', searchable: true, cond: lambda { |_col, term|
        next if term.exclude?('-dtf_delim-')
        from_s, to_s = term.split('-dtf_delim-')
        col = User.arel_table[:created_at]
        parse = ->(s) { Date.strptime(s, '%d/%m/%Y').to_time rescue nil }
        conds = []
        conds << col.gteq(parse.(from_s).beginning_of_day) if from_s.present? && parse.(from_s)
        conds << col.lteq(parse.(to_s).end_of_day)         if to_s.present?   && parse.(to_s)
        conds.reduce { |a, b| a.and(b) }
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
        age:        user.age,
        created_at: user.created_at.strftime('%d/%m/%Y'),
        DT_RowId:   "user-#{user.id}",
      }
    end
  end

  def get_raw_records
    User.all
  end

  def as_json(options = {})
    super.merge(
      # column_id 3 = role — populates the select filter dropdown via _dt_on_draw
      dt_filter_data_3: User.roles.keys.map { |r| { value: r, label: r.capitalize } }
    )
  end
end
