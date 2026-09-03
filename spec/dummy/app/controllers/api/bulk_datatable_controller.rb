# frozen_string_literal: true

module Api
  class BulkDatatableController < ApplicationController
    # records_selected is what WithCheckBoxes#_update_select_all_global_count
    # renders into .selected-count. It is the only channel through which the
    # result of a bulk POST becomes visible in the page, so it is also how a
    # system spec observes that the POST was accepted.
    def index
      render json: BulkDatatable.new(params, records_selected: session[:bulk_selected].to_i).as_json
    end
  end
end
