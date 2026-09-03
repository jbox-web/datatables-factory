# frozen_string_literal: true

Rails.application.routes.draw do
  root to: 'basic#index'

  resources :users, only: [:show, :edit, :destroy]

  get 'basic',        to: 'basic#index',        as: :basic
  get 'filters',      to: 'filters#index',      as: :filters
  get 'sliders',      to: 'sliders#index',      as: :sliders
  get 'checkboxes',   to: 'checkboxes#index',   as: :checkboxes
  get  'context_menu',      to: 'context_menu#index', as: :context_menu
  get  'context_menu/menu', to: 'context_menu#menu',  as: :context_menu_menu
  get 'buttons',      to: 'buttons#index',      as: :buttons
  get 'namespaced',   to: 'namespaced#index',   as: :namespaced

  get 'multi',        to: 'multi#index',        as: :multi
  get 'defaults',     to: 'defaults#index',     as: :defaults

  # Bulk actions: the two state-changing endpoints the select_all /
  # reset_selection buttons POST to. They are the only routes in this app
  # reached through WithButtons#_call_url rather than through the table's own
  # ajax option, so they are also the only ones that exercise its CSRF handling.
  get  'bulk',                 to: 'bulk#index',           as: :bulk
  post 'bulk/select_all',      to: 'bulk#select_all',      as: :bulk_select_all
  post 'bulk/reset_selection', to: 'bulk#reset_selection', as: :bulk_reset_selection

  namespace :api do
    post 'basic_datatable',        to: 'basic_datatable#index',        as: :basic_datatable
    post 'filters_datatable',      to: 'filters_datatable#index',      as: :filters_datatable
    post 'checkboxes_datatable',   to: 'checkboxes_datatable#index',   as: :checkboxes_datatable
    post 'context_menu_datatable', to: 'context_menu_datatable#index', as: :context_menu_datatable
    post 'buttons_datatable',      to: 'buttons_datatable#index',      as: :buttons_datatable
    post 'namespaced_datatable',   to: 'namespaced_datatable#index',   as: :namespaced_datatable
    post 'bulk_datatable',         to: 'bulk_datatable#index',         as: :bulk_datatable
    post 'defaults_datatable',     to: 'defaults_datatable#index',     as: :defaults_datatable
  end
end
