class HomeController < ApplicationController
  def index
  end

  def sandbox
    render layout: "swindytree"
  end
end
