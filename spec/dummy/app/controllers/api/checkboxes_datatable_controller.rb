# frozen_string_literal: true

module Api
  class CheckboxesDatatableController < ApplicationController
    def index
      render json: CheckboxesDatatable.new(params).as_json
    end
  end
end
