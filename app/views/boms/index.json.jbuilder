json.array!(@boms) do |bom|
  json.extract! bom, :name
  json.url bom_url(bom, format: :json)
end
