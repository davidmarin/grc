class Request < ActiveRecord::Base
  include AuthoredModel
  include AuthorizedModel
  include SanitizableAttributes

  attr_accessible :pbc_list, :type, :control, :pbc_control_code, :pbc_control_desc, :request, :test, :notes, :company_responsible, :auditor_responsible, :date_requested, :status

  belongs_to :pbc_list
  belongs_to :control

  is_versioned_ext

  sanitize_attributes :pbc_control_desc, :request, :test, :notes

  validates :pbc_list,
    :presence => { :message => "needs a value" }

  def display_name
    pbc_control_code
  end
end
