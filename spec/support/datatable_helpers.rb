# frozen_string_literal: true

module DatatableHelpers

  # DataTables throws away and re-creates its <tr> nodes on every draw. Capybara
  # resolves a selector into node handles first, then queries each one to apply
  # its filters — so a redraw landing between the two steps leaves it holding
  # detached nodes, which it reports as "<<ERROR>>". Retrying does not help when
  # draws keep coming: it re-resolves and loses the race again.
  #
  # Counting in a single JS call avoids the two-step problem entirely: the count
  # is taken atomically, from the live DOM, with no handles kept around.
  def datatable_row_count(selector)
    page.evaluate_script("document.querySelectorAll(#{selector.to_json} + ' tbody tr').length").to_i
  end

  # Blocks until the table holds the expected number of rows AND has stopped
  # changing. jQuery.active covers the request, the stable-count check covers the
  # rendering that follows it.
  def wait_for_rows(selector, count:, wait: 15)
    deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + wait
    stable   = 0
    last     = nil

    loop do
      current = datatable_row_count(selector)
      stable  = current == last ? stable + 1 : 0
      last    = current

      return current if current == count && stable >= 2
      break if Process.clock_gettime(Process::CLOCK_MONOTONIC) > deadline

      sleep 0.1
    end

    raise "expected #{count} rows in #{selector}, still #{last} after #{wait}s"
  end

  # Every server-side draw goes through a jQuery ajax request, so waiting for
  # jQuery.active to reach zero is a real synchronisation point. Note that
  # .dt-processing is NOT usable here: the dummy app never renders it, since it
  # does not enable DataTables' `processing` option.
  def wait_for_datatable(wait: Capybara.default_max_wait_time)
    deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + wait

    loop do
      break if page.evaluate_script('window.jQuery ? jQuery.active : 0').to_i.zero?
      break if Process.clock_gettime(Process::CLOCK_MONOTONIC) > deadline

      sleep 0.05
    end
  end

  # Navigating back to a visited page, Turbo instantly shows its cached
  # snapshot — old table rows included — and only then swaps in the fresh
  # response and fires turbo:load. Any find/fill_in landing on that preview
  # passes against DOM that is about to be thrown away: assertions satisfied
  # before the re-init even started, input typed into a node that gets replaced.
  #
  # Waiting for the data-turbo-preview attribute to clear is NOT reliable: if
  # the check runs before Turbo has shown the preview at all, the attribute is
  # absent and the wait falls through — same race, one step earlier. The only
  # deterministic signal is the navigation's own turbo:load, so a marker is
  # armed BEFORE the click (the JS context survives Turbo navigations) and
  # waited on after it.
  def turbo_click(locator, wait: Capybara.default_max_wait_time)
    page.execute_script(<<~JS)
      window.__dtf_turbo_loaded = false
      document.addEventListener('turbo:load', function () {
        window.__dtf_turbo_loaded = true
      }, { once: true })
    JS

    click_link locator

    loaded = wait_for_js('window.__dtf_turbo_loaded', wait: wait)
    raise "turbo:load did not fire within #{wait}s after clicking #{locator.inspect}" unless loaded

    wait_for_datatable(wait: wait)
  end

  # Same arming trick as turbo_click, for the browser's Back button. A
  # restoration visit is the one case where Turbo puts back a snapshot of the
  # DOM *as the page was left* — JS-generated nodes included — and then fires
  # turbo:load on it, so anything the host re-runs there runs against markup
  # that is not the server's.
  def turbo_go_back(wait: Capybara.default_max_wait_time)
    page.execute_script(<<~JS)
      window.__dtf_turbo_loaded = false
      document.addEventListener('turbo:load', function () {
        window.__dtf_turbo_loaded = true
      }, { once: true })
    JS

    page.go_back

    loaded = wait_for_js('window.__dtf_turbo_loaded', wait: wait)
    raise "turbo:load did not fire within #{wait}s after going back" unless loaded

    wait_for_datatable(wait: wait)
  end

  # Polls a JS expression until it is truthy. For assertions on instrumentation
  # counters (window.__foo) that are bumped asynchronously after a navigation.
  def wait_for_js(expression, wait: Capybara.default_max_wait_time)
    deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + wait

    loop do
      value = page.evaluate_script(expression)
      return value if value
      break if Process.clock_gettime(Process::CLOCK_MONOTONIC) > deadline

      sleep 0.05
    end

    page.evaluate_script(expression)
  end

end

RSpec.configure do |config|
  config.include DatatableHelpers, type: :system
end
