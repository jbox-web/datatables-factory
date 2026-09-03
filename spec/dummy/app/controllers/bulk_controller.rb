# frozen_string_literal: true

# The two bulk endpoints keep their result in the session rather than in the
# database: what the specs need to observe is that the POST was *accepted* and
# that the count it produced comes back down through the next draw. Writing rows
# would add a second failure mode to a page whose whole point is the request.
#
# Both inherit ApplicationController, so both sit behind
# `protect_from_forgery with: :exception` — deliberately, since the library is
# responsible for sending the token (README, § CSRF).
class BulkController < ApplicationController

  def index; end


  # `_call_url` sets length = -1 to mean "everything the current filter matches",
  # which is what the real host application answers to as well.
  def select_all
    session[:bulk_selected] = params[:length].to_i.negative? ? User.count : Array(params[:selected]).size
    head :ok
  end


  def reset_selection
    session[:bulk_selected] = 0
    head :ok
  end

end
