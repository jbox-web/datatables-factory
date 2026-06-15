# frozen_string_literal: true

module Api
  class BasicDatatableController < ApplicationController
    def index
      render json: BasicDatatable.new(params).as_json
    end
  end
end
