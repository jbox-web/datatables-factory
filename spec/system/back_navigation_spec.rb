# frozen_string_literal: true

require 'rails_helper'

# What a restoration visit does to a table, which nothing covered before.
#
# The host application only ever calls load_datatables() from turbo:load. A
# forward navigation replaces the body with the server's markup, so the filter
# containers come back empty and nothing can stack. The Back button does not:
# Turbo puts back the snapshot it cached when the page was left — JS-generated
# filter widgets included — and fires turbo:load on that. Loader.load then finds
# `instance` still set, destroys it, and rebuilds on top of markup that is not
# the server's.
#
# Measured here, the two picker branches fail differently and both fail:
#
#   flatpickr    the rebuild goes through and stacks a second widget set on the
#                restored one — 2 wrappers, 3 inputs sharing an id.
#   jQuery UI    destroy() throws first, so nothing is rebuilt: the markup stays
#                single but the table is never re-initialised and the filters
#                are dead.
#
# js_errors is off for this file: one of the two paths throws, and that throw is
# part of what is being measured. Restoring the shared driver is part of the fix.
RSpec.describe 'Coming back to a datatable page', :js do
  before do
    driven_by :cuprite_tolerating_js_errors,
              screen_size: CUPRITE_DRIVER_OPTIONS[:window_size],
              options:     CUPRITE_DRIVER_OPTIONS.deep_dup.merge(js_errors: false)

    3.times do |i|
      User.create!(
        first_name: format('User%02d', i),
        last_name:  format('Last%02d', i),
        email:      "u#{i}@back.com",
        role:       %i[user admin moderator][i],
        age:        60 + i,
        created_at: (i + 1).months.ago
      )
    end
  end

  # Counted in one JS call, like wait_for_rows and for the same reason.
  def count_in(selector)
    page.evaluate_script("document.querySelectorAll(#{selector.to_json}).length").to_i
  end

  # The filter containers are emitted empty by SearchFormBuilder#basic_field, so
  # whatever they hold was put there by the library.
  describe '/filters — range_date on the jQuery UI datepicker' do
    let(:container) { '#filters-first-name-filter' }

    before do
      visit '/filters'
      wait_for_rows('#filters-datatable', count: 3)
    end

    it 'builds exactly one widget per filter on the first visit' do
      expect(count_in("#{container} div.dtf-filter-wrapper")).to eq(1)
      expect(count_in("#{container} input.dtf-filter")).to eq(1)
    end

    # The markup stays single here only because the rebuild never happens.
    it 'still holds exactly one widget per filter after a Back navigation' do
      turbo_click 'Basic'
      turbo_go_back

      expect(count_in("#{container} div.dtf-filter-wrapper")).to eq(1)
      expect(count_in("#{container} input.dtf-filter")).to eq(1)
    end

    # COR-range_date_filter.coffee:45 — destroy() calls .datepicker('destroy')
    # on the input of the RESTORED snapshot, a different node from the one the
    # picker was attached to, so jQuery UI dereferences data it no longer has:
    # "TypeError: Cannot read properties of undefined (reading 'append')" out of
    # _destroyDatepicker. The throw escapes Loader.load before it reaches
    # klass.instance = create(...), so the page keeps the instance from the
    # previous visit. Note it also aborts destroy() itself, one line before
    # `@datatable = null` — so asserting on instance.datatable proves nothing;
    # the identity of the instance is what tells a rebuild from an abort.
    it 'installs a new instance after a Back navigation' do
      pending 'COR-range_date_filter.coffee:45 — datepicker(destroy) throws on the restored snapshot and aborts the rebuild'

      page.execute_script('window.__dtf_previous = window.Datatables.FiltersDatatable.instance')
      turbo_click 'Basic'
      turbo_go_back

      same = page.evaluate_script('window.__dtf_previous === window.Datatables.FiltersDatatable.instance')
      expect(same).to be(false)
    end

    it 'still filters from the visible input after a Back navigation' do
      pending 'COR-range_date_filter.coffee:45 — the aborted rebuild leaves the filter unbound'

      turbo_click 'Basic'
      turbo_go_back
      fill_in 'dtf-filter-filters-datatable-0', with: 'User01'

      expect(wait_for_rows('#filters-datatable', count: 1)).to eq(1)
    end
  end

  # The same page shape with the picker the host application actually runs.
  # Nothing throws here, so the rebuild completes — on top of the restored
  # widgets.
  describe '/bulk — range_date on flatpickr' do
    let(:container) { '#bulk-first-name-filter' }

    before do
      visit '/bulk'
      wait_for_rows('#bulk-datatable', count: 3)
    end

    it 'builds exactly one widget per filter on the first visit' do
      expect(count_in("#{container} div.dtf-filter-wrapper")).to eq(1)
      expect(count_in("#{container} input.dtf-filter")).to eq(1)
    end

    # COR-base_filter.coffee:51 — create_html only appends and no filter empties
    # its container, so the rebuild stacks a second widget set on the restored
    # one. Measured: 2 wrappers and 3 inputs sharing #dtf-filter-bulk-datatable-1,
    # which is the shape the jest probe produced for an in-place reload.
    it 'still holds exactly one widget per filter after a Back navigation' do
      pending 'COR-base_filter.coffee:51 — create_html appends onto the widgets restored from the Turbo snapshot'

      turbo_click 'Basic'
      turbo_go_back

      expect(count_in("#{container} div.dtf-filter-wrapper")).to eq(1)
      expect(count_in("#{container} input.dtf-filter")).to eq(1)
    end

    # The user-visible half: three inputs answer to the same id, and the one
    # jQuery resolves is the stale one bound to the destroyed instance.
    it 'still filters from the visible input after a Back navigation' do
      pending 'COR-base_filter.coffee:51 — duplicate ids, and the first match belongs to the destroyed instance'

      turbo_click 'Basic'
      turbo_go_back
      fill_in 'dtf-filter-bulk-datatable-1', with: 'User01'

      expect(wait_for_rows('#bulk-datatable', count: 1)).to eq(1)
    end
  end
end
