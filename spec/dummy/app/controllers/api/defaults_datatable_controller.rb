# frozen_string_literal: true

module Api
  class DefaultsDatatableController < ApplicationController
    def index
      render json: DefaultsDatatable.new(params).as_json
    end
  end
end
