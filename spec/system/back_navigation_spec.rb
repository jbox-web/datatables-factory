# frozen_string_literal: true

require 'rails_helper'

# What a restoration visit does to a table.
#
# The host application only ever calls load_datatables() from turbo:load. A
# forward navigation replaces the body with the server's markup, so the filter
# containers come back empty and nothing can stack. The Back button does not:
# Turbo puts back the snapshot it cached when the page was left — JS-generated
# filter widgets included — and fires turbo:load on that. Loader.load then finds
# `instance` still set, destroys it, and rebuilds on markup that is not the
# server's.
#
# Both picker branches used to break there, differently:
#
#   flatpickr    the rebuild went through and stacked a second widget set on the
#                restored one — 2 wrappers, 3 inputs sharing an id, and the one
#                jQuery resolved belonged to the destroyed instance.
#   jQuery UI    destroy() threw first (the hasDatepicker class comes back with
#                the markup, the instance does not), so nothing was rebuilt: the
#                markup stayed single and the table went dead.
#
# js_errors is deliberately left ON here: the jQuery UI half was an uncaught
# exception, and this file is what keeps it from coming back.
RSpec.describe 'Coming back to a datatable page', :js do
  before do
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

    it 'still holds exactly one widget per filter after a Back navigation' do
      turbo_click 'Basic'
      turbo_go_back

      expect(count_in("#{container} div.dtf-filter-wrapper")).to eq(1)
      expect(count_in("#{container} input.dtf-filter")).to eq(1)
    end

    # The identity of the instance is what tells a rebuild from an abort: the
    # throw used to interrupt destroy() one line before `@datatable = null`, so
    # asserting on instance.datatable proved nothing.
    it 'installs a new instance after a Back navigation' do
      page.execute_script('window.__dtf_previous = window.Datatables.FiltersDatatable.instance')
      turbo_click 'Basic'
      turbo_go_back

      same = page.evaluate_script('window.__dtf_previous === window.Datatables.FiltersDatatable.instance')
      expect(same).to be(false)
    end

    it 'still filters from the visible input after a Back navigation' do
      turbo_click 'Basic'
      turbo_go_back

      fill_in 'dtf-filter-filters-datatable-0', with: 'User01'

      expect(wait_for_rows('#filters-datatable', count: 1)).to eq(1)
    end
  end

  # The same page shape with the picker the host application actually runs.
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

    it 'still holds exactly one widget per filter after a Back navigation' do
      turbo_click 'Basic'
      turbo_go_back

      expect(count_in("#{container} div.dtf-filter-wrapper")).to eq(1)
      expect(count_in("#{container} input.dtf-filter")).to eq(1)
    end

    # The user-visible half: with a second set stacked on the first, three inputs
    # answered to the same id and jQuery resolved the stale one.
    it 'still filters from the visible input after a Back navigation' do
      turbo_click 'Basic'
      turbo_go_back

      fill_in 'dtf-filter-bulk-datatable-1', with: 'User01'

      expect(wait_for_rows('#bulk-datatable', count: 1)).to eq(1)
    end

    # The Bootstrap wrapping in init_filters runs on every load and used to add
    # three levels of nesting each time.
    it 'does not nest the Bootstrap wrapping deeper on each visit' do
      turbo_click 'Basic'
      turbo_go_back

      expect(count_in("#{container} div.mb-3.row")).to eq(1)
      expect(count_in("#{container} div.input-group")).to eq(1)
    end
  end
end
