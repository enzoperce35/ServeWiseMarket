delivery_groups = {
  "Now"  => -1,
  "6am"  => 6,
  "7am"  => 7,
  "8am"  => 8,
  "9am"  => 9,
  "10am" => 10,
  "11am" => 11,
  "12pm" => 12,
  "1pm"  => 13,
  "2pm"  => 14,
  "3pm"  => 15,
  "4pm"  => 16,
  "5pm"  => 17,
  "6pm"  => 18,
  "7pm"  => 19,
  "8pm"  => 20
}

delivery_groups.each do |name, hour|
  DeliveryGroup.find_or_create_by!(name: name) do |group|
    group.ph_timestamp = hour
    group.active = true
  end
end

puts "✅ Seeded #{DeliveryGroup.count} delivery groups"
