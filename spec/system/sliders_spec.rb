# frozen_string_literal: true

require 'rails_helper'

# The jest specs run against a stub of noUiSlider. This is where the real library
# is exercised: that it initialises at all, that the values it hands the filter
# reach the server in the form range_number already uses, and that the two inputs
# it drives are the ones the rest of the plumbing reads from.
RSpec.describe 'Date and slider filters datatable', :js do
  let(:table) { '#sliders-datatable' }

  before do
    User.create!(first_name: 'Alice', last_name: 'Smith', email: 'alice@sliders.com', role: :admin,     age: 30,
                 created_at: Time.zone.local(2024, 3, 15, 10, 0))
    User.create!(first_name: 'Bob',   last_name: 'Jones', email: 'bob@sliders.com',   role: :user,      age: 25,
                 created_at: Time.zone.local(2024, 6, 20, 10, 0))
    User.create!(first_name: 'Carol', last_name: 'Lee',   email: 'carol@sliders.com', role: :moderator, age: 40,
                 created_at: Time.zone.local(2024, 9, 25, 10, 0))
  end

  it 'shows the table with rows' do
    visit '/sliders'

    expect(page).to have_css('#sliders-datatable_wrapper', wait: 5)
    wait_for_rows(table, count: 3)
  end

  describe 'the slider' do
    it 'initialises the real noUiSlider on the container' do
      visit '/sliders'
      expect(page).to have_css('#sliders-datatable_wrapper', wait: 5)

      expect(page).to have_css('.dtf-filter-slider.noUi-target', wait: 5)
      expect(page).to have_css('.dtf-filter-slider .noUi-handle', count: 2)
    end

    it 'hides the inputs it drives' do
      visit '/sliders'
      expect(page).to have_css('.dtf-filter-slider.noUi-target', wait: 5)

      expect(page).to have_css('#sliders-age-filter input.dtf-filter-range', visible: :hidden, count: 2)
      expect(page).to have_no_css('#sliders-age-filter input.dtf-filter-range', visible: :visible)
    end

    # The handles carry the value, so a range coming from the URL has to move
    # them: leaving them at the bounds would show an unfiltered slider over a
    # filtered table.
    it 'positions the handles on a range pre-applied from the URL' do
      visit '/sliders?dt_filters[age]=26-dtf_delim-45'
      expect(page).to have_css('.dtf-filter-slider.noUi-target', wait: 5)

      wait_for_rows(table, count: 2)
      expect(page).to have_text('Alice')
      expect(page).to have_text('Carol')

      bounds = page.evaluate_script(
        "$('.dtf-filter-slider')[0].noUiSlider.get().map(Number)"
      )
      expect(bounds).to eq([26, 45])
    end

    # noUiSlider fires 'change' only from a real interaction — which is why the
    # filter binds to it, and why nothing programmatic can make the table reload
    # by accident. The keyboard is that interaction here: it moves the handle
    # through the library's own handler, and it is also the only way left to
    # reach a precise value now that the inputs are hidden.
    it 'sends the range to the server when a handle is moved with the keyboard' do
      visit '/sliders'
      expect(page).to have_css('.dtf-filter-slider.noUi-target', wait: 5)
      wait_for_rows(table, count: 3)

      # step is 1, so ten presses take the lower bound from 18 to 28 — past Bob,
      # who is 25, which is what makes the row count prove the filtering.
      handle = find('.dtf-filter-slider .noUi-handle-lower')
      10.times { handle.send_keys(:right) }

      wait_for_datatable

      search = page.evaluate_script("$('#sliders-datatable').DataTable().column(2).search()")
      expect(search).to eq('28-dtf_delim-80')
      wait_for_rows(table, count: 2)
      expect(page).to have_no_text('Bob')
    end
  end

  describe 'the single date filter' do
    it 'renders one input, not a range' do
      visit '/sliders'
      expect(page).to have_css('#sliders-datatable_wrapper', wait: 5)

      expect(page).to have_css('#sliders-created-at-filter input.dtf-filter', count: 1, wait: 5)
    end

    it 'filters the table on the day that was typed' do
      visit '/sliders'
      wait_for_rows(table, count: 3)

      find('#sliders-created-at-filter input.dtf-filter').set('15/03/2024')

      wait_for_rows(table, count: 1)
      expect(page).to have_text('Alice')
    end

    # A half-typed date is not a criterion: sending it would empty the table under
    # the user's fingers on the way to a valid one.
    it 'leaves the table alone while the date is incomplete' do
      visit '/sliders'
      wait_for_rows(table, count: 3)

      find('#sliders-created-at-filter input.dtf-filter').set('15/0')

      wait_for_datatable
      wait_for_rows(table, count: 3)
      expect(page).to have_text('Bob')
    end

    it 'pre-applies a date coming from the URL' do
      visit '/sliders?dt_filters[created_at]=20/06/2024'
      expect(page).to have_css('#sliders-datatable_wrapper', wait: 5)

      wait_for_rows(table, count: 1)
      expect(page).to have_text('Bob')
      expect(find('#sliders-created-at-filter input.dtf-filter').value).to eq('20/06/2024')
    end
  end

  it 'clears both filters with the reset button' do
    visit '/sliders'
    wait_for_rows(table, count: 3)

    find('#sliders-created-at-filter input.dtf-filter').set('15/03/2024')
    wait_for_rows(table, count: 1)

    find('button[title="Reset all filters"]').click

    wait_for_rows(table, count: 3)
    expect(find('#sliders-created-at-filter input.dtf-filter').value).to eq('')
  end
end
