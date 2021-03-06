# An Audit Cycle
#
# Used to group evidence for a particular audit of a directive
# start_at is the audit period start date.  If missing, this is a continuous process.
class Cycle < ActiveRecord::Base
  include CommonModel
  include AuthorizedModel
  include SanitizableAttributes

  attr_accessible :directive, :start_at, :complete, :title, :audit_firm, :audit_lead, :description, :list_import_date, :status, :notes, :end_at

  # The directive being audited
  belongs_to :directive

  has_many :pbc_lists, :foreign_key => :audit_cycle_id

  sanitize_attributes :description, :notes

  validates :title, :directive, :directive_id, :start_at,
    :presence => { :message => "needs a value" }

  is_versioned_ext

  after_create :create_pbc_list

  def display_name
    directive.display_name + " " + (start_at.strftime("%Y-%m-%d") rescue "-")
  end

  def slug
    directive.slug + "-" + (start_at.strftime("%Y-%m-%d") rescue "-")
  end

  def create_pbc_list
    pbc_list = PbcList.new
    pbc_list.audit_cycle = self
    pbc_list.save
  end

  def created_by
    userid = Version.where({:item_id => self[:id], :item_type => self.class.name}).first[:whodunnit] rescue nil
    userid.nil? ? modified_by : Person.where({:id => userid}).first
  end

  def ca_request_stats
    cas = []
    rqs = []
    scs = {}
    total_sc = 0
    self.pbc_lists.each do |pbc_list|
      cas.concat pbc_list.requests.map{|rq| rq.control_assessment}
      rqs.concat pbc_list.requests
      status_counts, status_percentages = pbc_list.request_stats
      Request.statuses.each do |status|
        scs[status] = (scs[status].nil? ? 0 : scs[status]) + status_counts[status]
        total_sc += status_counts[status]
      end
    end
    cas = cas.uniq
    [cas.count, rqs.count, scs, scs.merge(scs){|k, sc| total_sc == 0 ? 0 : sc * 100 / total_sc}]
  end
end
