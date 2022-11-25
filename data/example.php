<?php
$storage_dir = '_GIAB_HG002';
$signal_size = 512;

$db = new PDO("sqlite:{$storage_dir}/index.db");
$bc = fopen("{$storage_dir}/storage.bcov", 'rb');

$stmt = $db->prepare("SELECT * FROM signal as s LEFT JOIN target AS t ON t.id = s.target_id LIMIT 10");
$stmt->execute([]);
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $item) {
    fseek($bc, $item['coverage_offset'] * 2);
    $bcov = array_values(unpack("C*", fgets($bc, $signal_size * 2)));
    $item['coverage'] = [];
    for ($i = 0; $i < $signal_size; $i += 2) {
        $item['coverage'][] = $bcov[$i] * 256 + $bcov[$i + 1];
    }
    print_r($item);
}