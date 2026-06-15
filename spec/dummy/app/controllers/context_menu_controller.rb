# frozen_string_literal: true

class ContextMenuController < ApplicationController
  def index; end

  def menu
    render layout: false
  end
end
