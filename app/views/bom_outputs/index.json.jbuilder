json.array!(@bom_outputs) do |bom_output|
  json.extract! bom_output, :item_id, :qty
  json.url bom_output_url(bom_output, format: :json)
end
