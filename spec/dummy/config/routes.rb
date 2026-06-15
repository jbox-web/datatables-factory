# frozen_string_literal: true

Rails.application.routes.draw do
  root to: 'basic#index'

  resources :users, only: [:show, :edit, :destroy]

  get 'basic',        to: 'basic#index',        as: :basic
  get 'filters',      to: 'filters#index',      as: :filters
  get 'checkboxes',   to: 'checkboxes#index',   as: :checkboxes
  get  'context_menu',      to: 'context_menu#index', as: :context_menu
  get  'context_menu/menu', to: 'context_menu#menu',  as: :context_menu_menu
  get 'buttons',      to: 'buttons#index',      as: :buttons
  get 'namespaced',   to: 'namespaced#index',   as: :namespaced

  namespace :api do
    post 'basic_datatable',        to: 'basic_datatable#index',        as: :basic_datatable
    post 'filters_datatable',      to: 'filters_datatable#index',      as: :filters_datatable
    post 'checkboxes_datatable',   to: 'checkboxes_datatable#index',   as: :checkboxes_datatable
    post 'context_menu_datatable', to: 'context_menu_datatable#index', as: :context_menu_datatable
    post 'buttons_datatable',      to: 'buttons_datatable#index',      as: :buttons_datatable
    post 'namespaced_datatable',   to: 'namespaced_datatable#index',   as: :namespaced_datatable
  end
end
