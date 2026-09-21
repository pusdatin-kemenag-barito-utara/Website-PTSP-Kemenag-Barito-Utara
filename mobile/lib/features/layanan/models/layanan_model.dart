/// Model data Layanan Publik PTSP
class LayananModel {
  final String id;
  final String title;
  final String slug;
  final String? description;
  final String? icon;
  final String? category;
  final int? estimatedDays;
  final String? cost;
  final bool isActive;

  LayananModel({
    required this.id,
    required this.title,
    required this.slug,
    this.description,
    this.icon,
    this.category,
    this.estimatedDays,
    this.cost,
    this.isActive = true,
  });

  factory LayananModel.fromJson(Map<String, dynamic> json) {
    return LayananModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? json['nama_layanan'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String? ?? json['deskripsi'] as String?,
      icon: json['icon'] as String?,
      category: json['category'] as String? ?? json['kategori'] as String?,
      estimatedDays: json['estimated_days'] as int? ?? json['estimasi_hari'] as int?,
      cost: json['cost'] as String? ?? 'Gratis (Rp 0)',
      isActive: json['is_active'] as bool? ?? true,
    );
  }
}

/// Model data Persyaratan Layanan
class RequirementModel {
  final String id;
  final String name;
  final String? description;
  final bool isRequired;

  RequirementModel({
    required this.id,
    required this.name,
    this.description,
    this.isRequired = true,
  });

  factory RequirementModel.fromJson(Map<String, dynamic> json) {
    return RequirementModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? json['nama'] as String? ?? '',
      description: json['description'] as String?,
      isRequired: json['is_required'] as bool? ?? true,
    );
  }
}
