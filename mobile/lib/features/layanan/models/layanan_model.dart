/// Model data Layanan PTSP Kemenag Barito Utara (Bidang / Unit Kerja & Layanan ASN)
class ServiceModel {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? category; // 'public' | 'asn'
  final String? roleOwner;
  final String? requirementsText;
  final String? sopUrl;
  final int sortOrder;
  final bool isActive;
  final String? requestCode;
  final List<ServiceItemModel> items;

  ServiceModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.category,
    this.roleOwner,
    this.requirementsText,
    this.sopUrl,
    this.sortOrder = 0,
    this.isActive = true,
    this.requestCode,
    this.items = const [],
  });

  /// Alias title untuk kompatibilitas kode lama
  String get title => name;

  /// Estimasi biaya default PTSP (Gratis Rp 0)
  String get cost => 'Gratis (Rp 0)';

  /// Estimasi waktu default jika ada
  String get defaultEstimatedTime {
    if (items.isNotEmpty) {
      for (final it in items) {
        if (it.estimatedTime != null && it.estimatedTime!.isNotEmpty) {
          return it.estimatedTime!;
        }
      }
    }
    return '1–3 Hari Kerja';
  }

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] ?? json['service_items'] ?? json['serviceItems'];
    final List<ServiceItemModel> parsedItems = [];
    if (rawItems is List) {
      for (final item in rawItems) {
        if (item is Map<String, dynamic>) {
          parsedItems.add(ServiceItemModel.fromJson(item));
        }
      }
    }

    return ServiceModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? json['title'] as String? ?? json['nama_layanan'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String? ?? json['deskripsi'] as String?,
      category: json['category'] as String? ?? json['kategori'] as String? ?? 'public',
      roleOwner: json['role_owner'] as String? ?? json['roleOwner'] as String?,
      requirementsText: json['requirements_text'] as String? ?? json['requirementsText'] as String?,
      sopUrl: json['sop_url'] as String? ?? json['sopUrl'] as String?,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? (json['sortOrder'] as num?)?.toInt() ?? 0,
      isActive: json['is_active'] as bool? ?? json['isActive'] as bool? ?? true,
      requestCode: json['request_code'] as String? ?? json['requestCode'] as String?,
      items: parsedItems,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'category': category,
      'role_owner': roleOwner,
      'requirements_text': requirementsText,
      'sop_url': sopUrl,
      'sort_order': sortOrder,
      'is_active': isActive,
      'request_code': requestCode,
      'items': items.map((e) => e.toJson()).toList(),
    };
  }
}

/// Alias LayananModel mengarah ke ServiceModel untuk kompatibilitas penuh
typedef LayananModel = ServiceModel;

/// Model Sub-Layanan spesifik dari sebuah Unit Kerja (misal: "Rekomendasi Pindah Madrasah")
class ServiceItemModel {
  final String id;
  final String serviceId;
  final String name;
  final String slug;
  final String? description;
  final String? estimatedTime;
  final bool isActive;
  final int sortOrder;
  final List<RequirementModel> requirements;
  final List<FormFieldModel> formFields;

  ServiceItemModel({
    required this.id,
    required this.serviceId,
    required this.name,
    required this.slug,
    this.description,
    this.estimatedTime,
    this.isActive = true,
    this.sortOrder = 0,
    this.requirements = const [],
    this.formFields = const [],
  });

  factory ServiceItemModel.fromJson(Map<String, dynamic> json) {
    final rawReqs = json['requirements'] ?? json['service_requirements'] ?? json['serviceRequirements'];
    final List<RequirementModel> parsedReqs = [];
    if (rawReqs is List) {
      for (final req in rawReqs) {
        if (req is Map<String, dynamic>) {
          parsedReqs.add(RequirementModel.fromJson(req));
        }
      }
    }

    final rawFields = json['form_fields'] ?? json['service_form_fields'] ?? json['formFields'];
    final List<FormFieldModel> parsedFields = [];
    if (rawFields is List) {
      for (final f in rawFields) {
        if (f is Map<String, dynamic>) {
          parsedFields.add(FormFieldModel.fromJson(f));
        }
      }
    }

    return ServiceItemModel(
      id: json['id']?.toString() ?? '',
      serviceId: (json['service_id'] ?? json['serviceId'])?.toString() ?? '',
      name: json['name'] as String? ?? json['nama'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String?,
      estimatedTime: json['estimated_time'] as String? ?? json['estimatedTime'] as String?,
      isActive: json['is_active'] as bool? ?? json['isActive'] as bool? ?? true,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? (json['sortOrder'] as num?)?.toInt() ?? 0,
      requirements: parsedReqs,
      formFields: parsedFields,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'service_id': serviceId,
      'name': name,
      'slug': slug,
      'description': description,
      'estimated_time': estimatedTime,
      'is_active': isActive,
      'sort_order': sortOrder,
      'requirements': requirements.map((e) => e.toJson()).toList(),
      'form_fields': formFields.map((e) => e.toJson()).toList(),
    };
  }
}

/// Model Persyaratan Berkas & Dokumen yang perlu diunggah oleh pemohon
class RequirementModel {
  final String id;
  final String serviceItemId;
  final String documentName;
  final String? description;
  final bool isRequired;
  final String? allowedExtensions;
  final int? maxFileSizeMb;
  final int sortOrder;

  RequirementModel({
    required this.id,
    required this.serviceItemId,
    required this.documentName,
    this.description,
    this.isRequired = true,
    this.allowedExtensions,
    this.maxFileSizeMb,
    this.sortOrder = 0,
  });

  /// Alias name untuk kompatibilitas kode UI lama
  String get name => documentName;

  factory RequirementModel.fromJson(Map<String, dynamic> json) {
    return RequirementModel(
      id: json['id']?.toString() ?? '',
      serviceItemId: (json['service_item_id'] ?? json['serviceItemId'])?.toString() ?? '',
      documentName: json['document_name'] as String? ??
          json['documentName'] as String? ??
          json['name'] as String? ??
          json['nama'] as String? ??
          '',
      description: json['description'] as String?,
      isRequired: json['is_required'] as bool? ?? json['isRequired'] as bool? ?? true,
      allowedExtensions: json['allowed_extensions'] as String? ?? json['allowedExtensions'] as String?,
      maxFileSizeMb: (json['max_file_size_mb'] as num?)?.toInt() ?? (json['maxFileSizeMb'] as num?)?.toInt(),
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? (json['sortOrder'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'service_item_id': serviceItemId,
      'document_name': documentName,
      'description': description,
      'is_required': isRequired,
      'allowed_extensions': allowedExtensions,
      'max_file_size_mb': maxFileSizeMb,
      'sort_order': sortOrder,
    };
  }
}

/// Model Kolom Formulir Isian Dinamis untuk Service Item
class FormFieldModel {
  final String id;
  final String serviceItemId;
  final String label;
  final String name;
  final String type;
  final String? placeholder;
  final bool isRequired;
  final String? options;
  final int sortOrder;

  FormFieldModel({
    required this.id,
    required this.serviceItemId,
    required this.label,
    required this.name,
    required this.type,
    this.placeholder,
    this.isRequired = true,
    this.options,
    this.sortOrder = 0,
  });

  factory FormFieldModel.fromJson(Map<String, dynamic> json) {
    return FormFieldModel(
      id: json['id']?.toString() ?? '',
      serviceItemId: (json['service_item_id'] ?? json['serviceItemId'])?.toString() ?? '',
      label: json['label'] as String? ?? '',
      name: json['name'] as String? ?? '',
      type: json['type'] as String? ?? 'text',
      placeholder: json['placeholder'] as String?,
      isRequired: json['is_required'] as bool? ?? json['isRequired'] as bool? ?? true,
      options: json['options'] as String?,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? (json['sortOrder'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'service_item_id': serviceItemId,
      'label': label,
      'name': name,
      'type': type,
      'placeholder': placeholder,
      'is_required': isRequired,
      'options': options,
      'sort_order': sortOrder,
    };
  }
}
