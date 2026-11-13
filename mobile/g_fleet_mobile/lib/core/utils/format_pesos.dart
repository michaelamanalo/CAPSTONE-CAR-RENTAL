String formatPesos(int amount) =>
    '₱${amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (match) => '${match[1]},')}';
