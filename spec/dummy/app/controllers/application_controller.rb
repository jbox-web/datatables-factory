# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Rails' default. :null_session would silently let unauthenticated table loads
  # through and hide the fact that the library must send the CSRF token.
  protect_from_forgery with: :exception
end
