# frozen_string_literal: true

require 'rails_helper'

# The bulk-action page is the one the host application actually runs and the
# dummy did not: a checkbox column plus `select_all` / `reset_selection` buttons
# carrying a `url:`, i.e. the only path that reaches WithButtons#_call_url.
#
# Everything about that path used to be covered by a stubbed `$.ajax` in
# spec/js/modules/with_buttons_spec.js, which by construction cannot see what
# the request carries — nor that the server rejects it.
RSpec.describe 'Bulk actions datatable', :js do
  before do
    # One user per role: the multi_select is only meaningful if selecting two of
    # the three narrows the table to two rows.
    %i[user admin moderator].each_with_index do |role, i|
      User.create!(
        first_name: format('User%02d', i),
        last_name:  format('Last%02d', i),
        email:      "u#{i}@bulk.com",
        role:       role,
        age:        30 + i,
        created_at: (i + 1).months.ago
      )
    end

    visit '/bulk'
    wait_for_rows('#bulk-datatable', count: 3)
  end

  it 'renders the checkbox column' do
    expect(page).to have_css('#bulk-datatable thead input[type="checkbox"]')
  end

  it 'renders both bulk buttons' do
    expect(page).to have_css('.dt-buttons button[title="Select all"]')
    expect(page).to have_css('.dt-buttons button[title="Reset selection"]')
  end

  it 'renders the selected-count container the dom option declares' do
    expect(page).to have_css('.selected-count')
  end

  # The button POST is the assertion that matters: it is state-changing, it goes
  # through _call_url, and the server counts what it received. Reaching the count
  # proves Rails accepted the request, i.e. that it carried its CSRF token.
  #
  # Both directions in one example on purpose: asserting "Total selected: 0"
  # after a reset proves nothing on its own, since the counter starts at 0 and a
  # rejected POST leaves it there. Only the 0 -> 3 -> 0 round trip distinguishes
  # an accepted request from a refused one.
  it 'records the server-side selection and clears it again' do
    expect(page).to have_css('.selected-count', text: 'Total selected: 0', wait: 5)

    find('.dt-buttons button[title="Select all"]').click
    wait_for_datatable
    expect(page).to have_css('.selected-count', text: 'Total selected: 3', wait: 5)

    find('.dt-buttons button[title="Reset selection"]').click
    wait_for_datatable
    expect(page).to have_css('.selected-count', text: 'Total selected: 0', wait: 5)
  end

  # dtf_options the host application sets globally and the dummy never did.
  it 'applies the configured reset-button class to the filter reset button' do
    expect(page).to have_css('.dtf-filter-reset-button.btn.btn-soft-secondary')
  end

  # The host application's tag filters: a multi_select whose option labels are
  # coloured badges built server-side. Without filter_html_labels tom-select
  # escapes them and the user sees the markup as text, so asserting on the badge
  # ELEMENT is what distinguishes the two.
  describe 'multi_select with HTML labels' do
    it 'renders the dropdown labels as markup, not as text' do
      find('.ts-wrapper .ts-control').click

      expect(page).to have_css('.ts-dropdown span.role-badge', count: 3, wait: 5)
      expect(page).to have_no_css('.ts-dropdown', text: '<span')
    end

    # The Admin badge is served with an inline handler and a javascript: link,
    # which is what one missed escape in a host application looks like. The
    # badge must render and both must be gone: the option renders markup, it
    # does not hand the response the run of the page.
    it 'renders the badge but strips what could execute' do
      find('.ts-wrapper .ts-control').click
      expect(page).to have_css('.ts-dropdown span.role-badge', count: 3, wait: 5)

      expect(page).to have_no_css('.ts-dropdown [onclick]')
      expect(page).to have_no_css('.ts-dropdown a[href^="javascript:"]')
      expect(page.evaluate_script('window.__dtf_pwned')).to be_nil
    end

    it 'filters on several values joined by the pipe separator' do
      find('.ts-wrapper .ts-control').click
      find('.ts-dropdown .option', text: 'Admin').click
      find('.ts-dropdown .option', text: 'Moderator').click

      expect(wait_for_rows('#bulk-datatable', count: 2)).to eq(2)
    end
  end

  # The only date configuration the host application runs. /filters keeps the
  # jQuery UI branch, so both are exercised.
  describe 'range_date driven by flatpickr' do
    it 'attaches a flatpickr calendar to the range inputs' do
      expect(page).to have_css('#dtf-filter-bulk-datatable-from-date-5.flatpickr-input')
    end

    it 'opens the calendar when the input is focused' do
      find('#dtf-filter-bulk-datatable-from-date-5').click

      expect(page).to have_css('.flatpickr-calendar.open', wait: 5)
    end

    # Picked in the calendar, not typed: flatpickr leaves its input readonly
    # unless allowInput is set, so typing is not the gesture a user has. The
    # click is also what exercises the branch that matters — flatpickr's
    # onChange, which RangeDateFilter routes to _date_select, since selecting a
    # date fires no keyup and the inherited handler would never run.
    #
    it 'filters when a date is picked in the calendar' do
      pick_first_day_of_the_current_month

      expect(page).to have_css('#bulk-datatable tbody', text: 'No matching records found', wait: 5)
    end

    # _date_select delegates to _range_change, so the calendar path marks the
    # input exactly like the keyboard one does.
    it 'marks the input as in use once a date is picked' do
      pick_first_day_of_the_current_month

      expect(page).to have_css('#dtf-filter-bulk-datatable-from-date-5.inuse', wait: 5)
    end

    # Any day of the current month works as a lower bound: every user was
    # created at least a month ago, so the table must come back empty.
    def pick_first_day_of_the_current_month
      find('#dtf-filter-bulk-datatable-from-date-5').click
      expect(page).to have_css('.flatpickr-calendar.open', wait: 5)
      first('.flatpickr-day:not(.prevMonthDay):not(.nextMonthDay)').click
      wait_for_datatable
    end
  end

  # The host application drives these two from turbo_stream responses, on 44
  # sites, i.e. from outside the table and at a moment it does not control. The
  # class-level guards added for that are only meaningful if something calls
  # them the way it does.
  describe 'class-level entry points' do
    it 'reloads the table when reload() is called from outside' do
      page.execute_script('window.__dtf_reloaded = false')
      page.execute_script(<<~JS)
        window.Datatables.BulkDatatable.reload(function () { window.__dtf_reloaded = true })
      JS

      expect(wait_for_js('window.__dtf_reloaded', wait: 5)).to be(true)
      expect(datatable_row_count('#bulk-datatable')).to eq(3)
    end

    it 'survives reload() called while no instance exists' do
      page.execute_script('delete window.Datatables.BulkDatatable.instance')

      error = page.evaluate_script(<<~JS)
        (function () {
          try { window.Datatables.BulkDatatable.reload(); return null }
          catch (e) { return e.message }
        })()
      JS

      expect(error).to be_nil
    end

    it 'survives reset_datatable_selection() called while no instance exists' do
      page.execute_script('delete window.Datatables.BulkDatatable.instance')

      error = page.evaluate_script(<<~JS)
        (function () {
          try { window.Datatables.BulkDatatable.reset_datatable_selection(); return null }
          catch (e) { return e.message }
        })()
      JS

      expect(error).to be_nil
    end
  end
end
