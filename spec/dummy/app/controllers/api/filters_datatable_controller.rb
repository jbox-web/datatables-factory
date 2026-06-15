# frozen_string_literal: true

module Api
  class FiltersDatatableController < ApplicationController
    def index
      render json: FiltersDatatable.new(params).as_json
    end
  end
end
