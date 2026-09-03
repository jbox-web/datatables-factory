# frozen_string_literal: true

require 'rails_helper'

# The host application initialises its tables on turbo:load, with no teardown.
# Navigating back to a page therefore runs Loader.load against a class whose
# `instance` is still alive, taking the "destroy and recreate" branch — a path
# a plain page load never exercises.
RSpec.describe 'Turbo navigation', :js do
  before do
    15.times do |i|
      User.create!(
        first_name: format('User%02d', i),
        last_name:  format('Last%02d', 14 - i),
        email:      "u#{i}@turbo.com",
        role:       :user,
        age:        20 + i
      )
    end
  end

  # Survives a Turbo visit, but not a full page load: proves the navigation
  # really is client-side, otherwise none of the tests below mean anything.
  def mark_window
    page.execute_script('window.__dtf_marker = "kept"')
  end

  def window_marker
    page.evaluate_script('window.__dtf_marker')
  end

  describe 'the navigation itself' do
    it 'keeps the JS context across a sidebar link' do
      visit '/basic'
      wait_for_rows('#basic-datatable', count: 10)
      mark_window

      turbo_click 'Buttons'
      expect(page).to have_css('#buttons-datatable_wrapper', wait: 5)

      expect(window_marker).to eq('kept')
    end

    it 'keeps the JS context when navigating back' do
      visit '/basic'
      wait_for_rows('#basic-datatable', count: 10)
      mark_window

      turbo_click 'Buttons'
      expect(page).to have_css('#buttons-datatable_wrapper', wait: 5)
      turbo_click 'Basic'
      expect(page).to have_css('#basic-datatable_wrapper', wait: 5)

      expect(window_marker).to eq('kept')
    end
  end

  # Scoped like the block below, and for the same reason: these examples assert
  # on rows of a table that has just drawn, and an unscoped 'tbody tr' both
  # races the redraw and matches any other table the page carries.
  describe 'a table reached through Turbo' do
    it 'loads its rows' do
      visit '/basic'
      wait_for_rows('#basic-datatable', count: 10)

      turbo_click 'Buttons'

      wait_for_datatable
      expect(wait_for_rows('#buttons-datatable', count: 10)).to eq(10)
    end

    it 'applies its declared default order' do
      visit '/basic'
      wait_for_rows('#basic-datatable', count: 10)

      turbo_click 'Buttons'

      wait_for_rows('#buttons-datatable', count: 10)
      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'User00', wait: 5)
    end

    it 'still sorts when a header is clicked' do
      visit '/basic'
      wait_for_rows('#basic-datatable', count: 10)
      turbo_click 'Buttons'
      wait_for_rows('#buttons-datatable', count: 10)
      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'User00', wait: 5)

      find('#buttons-datatable thead th', text: 'Last name').click
      wait_for_datatable
      wait_for_rows('#buttons-datatable', count: 10)

      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'Last00', wait: 5)
    end
  end

  # Guards the fidelity of the setup itself. If the demo ever went back to
  # defining its classes per page, `instance` would always be undefined, the
  # destroy branch would never run, and every test below would pass while
  # exercising nothing.
  describe 'the destroy-and-recreate path' do
    def instrument_destroy
      page.execute_script(<<~JS)
        window.__dtf_destroys = 0
        var Klass = window.Datatables.BasicDatatable
        var original = Klass.prototype.destroy
        Klass.prototype.destroy = function () {
          window.__dtf_destroys++
          return original.apply(this, arguments)
        }
        window.__dtf_had_instance = !!Klass.instance
      JS
    end

    # find/1 is used rather than expect: these are synchronisation points, not
    # assertions — they block until the table is there and raise otherwise.
    before do
      visit '/basic'
      find('#basic-datatable tbody tr', match: :first, wait: 5)
      instrument_destroy

      turbo_click 'Buttons'
      find('#buttons-datatable_wrapper', wait: 5)
      turbo_click 'Basic'
      find('#basic-datatable tbody tr', match: :first, wait: 5)
    end

    it 'keeps the previous instance alive across the navigation' do
      expect(page.evaluate_script('window.__dtf_had_instance')).to be(true)
    end

    it 'destroys it before recreating the table' do
      expect(wait_for_js('window.__dtf_destroys >= 1')).to be(true)
    end
  end

  # Every row assertion in this block goes through wait_for_rows and names its
  # table. Each example leaves a table drawing and comes back to it, so a bare
  # have_css('tbody tr') races the redraw: Capybara resolves the selector into
  # node handles and only then queries them, and a draw landing in between makes
  # it raise Capybara::Cuprite::ObsoleteNode. That is what took two of the eight
  # CI jobs down on the filter example below.
  #
  # The unscoped form is wrong twice over here: it also counts the rows of any
  # other table the page happens to carry.
  describe 'returning to a page whose table was already loaded' do
    it 'renders exactly one table, not a leftover duplicate' do
      visit '/basic'
      wait_for_rows('#basic-datatable', count: 10)
      turbo_click 'Buttons'
      expect(page).to have_css('#buttons-datatable_wrapper', wait: 5)

      turbo_click 'Basic'

      expect(page).to have_css('#basic-datatable_wrapper', count: 1, wait: 5)
    end

    it 'reloads its rows' do
      visit '/basic'
      wait_for_rows('#basic-datatable', count: 10)
      turbo_click 'Buttons'
      expect(page).to have_css('#buttons-datatable_wrapper', wait: 5)

      turbo_click 'Basic'

      wait_for_datatable
      expect(wait_for_rows('#basic-datatable', count: 10)).to eq(10)
    end

    it 'still sorts when a header is clicked' do
      visit '/basic'
      wait_for_rows('#basic-datatable', count: 10)
      turbo_click 'Buttons'
      expect(page).to have_css('#buttons-datatable_wrapper', wait: 5)
      turbo_click 'Basic'
      wait_for_datatable
      expect(wait_for_rows('#basic-datatable', count: 10)).to eq(10)

      find('#basic-datatable thead th', text: 'First name').click
      wait_for_datatable
      wait_for_rows('#basic-datatable', count: 10)

      expect(page).to have_css('#basic-datatable tbody tr:first-child', text: 'User00', wait: 5)
    end

    # The one that actually failed. On top of the race above, its filter is
    # debounced, which moves the redraw further from the keystroke and straight
    # into the polling window — reproduced locally at one run in five.
    it 'still filters after the round trip' do
      visit '/filters'
      wait_for_rows('#filters-datatable', count: 10)
      turbo_click 'Basic'
      expect(page).to have_css('#basic-datatable_wrapper', wait: 5)
      turbo_click 'Filters'
      wait_for_rows('#filters-datatable', count: 10)

      fill_in 'dtf-filter-filters-datatable-0', with: 'User07'

      expect(wait_for_rows('#filters-datatable', count: 1)).to eq(1)
    end
  end
end
