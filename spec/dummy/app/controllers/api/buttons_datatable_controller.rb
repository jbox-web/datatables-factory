# frozen_string_literal: true

module Api
  class ButtonsDatatableController < ApplicationController
    def index
      render json: ButtonsDatatable.new(params).as_json
    end
  end
end
