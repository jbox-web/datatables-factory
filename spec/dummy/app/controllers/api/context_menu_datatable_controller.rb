# frozen_string_literal: true

module Api
  class ContextMenuDatatableController < ApplicationController
    def index
      render json: ContextMenuDatatable.new(params).as_json
    end
  end
end
