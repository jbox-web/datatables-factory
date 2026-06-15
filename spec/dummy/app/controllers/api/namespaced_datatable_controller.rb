# frozen_string_literal: true

module Api
  class NamespacedDatatableController < ApplicationController
    def index
      render json: NamespacedDatatable.new(params).as_json
    end
  end
end
