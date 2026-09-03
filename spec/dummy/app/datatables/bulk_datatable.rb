# frozen_string_literal: true

class BulkDatatable < AjaxDatatablesRails::ActiveRecord

  # The colours are what makes these labels markup rather than text: they come
  # from data, so no stylesheet can carry them. This is the shape the host
  # application's tag badges have, and the reason its filters opt into
  # `filter_html_labels`.
  ROLE_COLORS = { 'user' => '#6c757d', 'admin' => '#dc3545', 'moderator' => '#0d6efd' }.freeze

  def view_columns
    @view_columns ||= {
      check_box:  { source: 'User.id',         orderable: false, searchable: false },
      first_name: { source: 'User.first_name', cond: :string_eq },
      last_name:  { source: 'User.last_name',  cond: :string_eq },
      email:      { source: 'User.email',      cond: :string_eq },
      # multi_select sends its values joined by '|', which is the format the
      # host application's server side splits on too.
      role:       { source: 'User.role', searchable: true, cond: lambda { |_col, term|
        keys = term.to_s.split('|').select { |k| User.roles.key?(k) }
        next if keys.empty?

        User.arel_table[:role].in(keys.map { |k| User.roles[k] })
      } },
      created_at: { source: 'User.created_at', searchable: true, cond: lambda { |_col, term|
        next if term.exclude?('-dtf_delim-')

        from_s, to_s = term.split('-dtf_delim-')
        col   = User.arel_table[:created_at]
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
        check_box:  '',
        first_name: user.first_name,
        last_name:  user.last_name,
        email:      user.email,
        role:       user.role.to_s.capitalize,
        created_at: user.created_at.strftime('%d/%m/%Y'),
        DT_RowId:   "user-#{user.id}",
      }
    end
  end

  def get_raw_records
    User.all
  end

  # records_selected is what WithCheckBoxes#_update_select_all_global_count
  # renders into .selected-count — the only channel through which the result of
  # a bulk POST becomes visible in the page. Sent on every response, not only
  # after a POST, so the figure survives a sort or a page change.
  #
  # column_id 4 = role — the multi_select dropdown, whose labels are HTML.
  def as_json(options = {})
    super.merge(
      records_selected: @options[:records_selected].to_i,
      dt_filter_data_4: User.roles.keys.map do |role|
        { value: role, label: role_badge(role) }
      end
    )
  end

  private

    # One badge deliberately carries an inline handler and a javascript: link,
    # which is what a single missed escape in a host application looks like. The
    # library renders the badge and strips both — see spec/system/bulk_spec.rb.
    def role_badge(role)
      attributes = %(class="badge role-badge" style="background-color: #{ROLE_COLORS.fetch(role)}")
      attributes += %( onclick="window.__dtf_pwned = true") if role == 'admin'
      inner = role == 'admin' ? %(<a href="javascript:window.__dtf_pwned = true">!</a>) : ''

      %(<span #{attributes}>#{role.capitalize}#{inner}</span>)
    end

end
