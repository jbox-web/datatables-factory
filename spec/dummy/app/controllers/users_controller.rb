# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :set_user

  def show; end

  def edit; end

  def destroy
    @user.destroy
    redirect_to context_menu_path, notice: "User ##{@user.id} deleted."
  end

  private

    def set_user
      @user = User.find(params[:id])
    end
end
