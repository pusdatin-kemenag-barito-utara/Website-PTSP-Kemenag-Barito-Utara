import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../models/layanan_model.dart';

/// Helper untuk metadata ikon dan warna seksi/bidang masyarakat
class BidangMeta {
  final IconData icon;
  final String shortName;

  const BidangMeta({required this.icon, required this.shortName});

  static BidangMeta get(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('madrasah') || lower.contains('penmad')) {
      return const BidangMeta(
        icon: LucideIcons.graduationCap,
        shortName: 'Pendidikan Madrasah',
      );
    }
    if (lower.contains('bimbingan masyarakat islam') || lower.contains('bimas islam') || lower.contains('nikah') || lower.contains('haji')) {
      return const BidangMeta(
        icon: LucideIcons.landmark,
        shortName: 'Bimas Islam',
      );
    }
    if (lower.contains('tata usaha') || lower.contains('sub bagian')) {
      return const BidangMeta(
        icon: LucideIcons.briefcase,
        shortName: 'Subbag Tata Usaha',
      );
    }
    if (lower.contains('agama islam') || lower.contains('pais')) {
      return const BidangMeta(
        icon: LucideIcons.bookOpen,
        shortName: 'Pendidikan Agama Islam (PAIS)',
      );
    }
    if (lower.contains('diniyah') || lower.contains('pontren') || lower.contains('pesantren')) {
      return const BidangMeta(
        icon: LucideIcons.bookOpen,
        shortName: 'PD Pontren',
      );
    }
    if (lower.contains('zakat') || lower.contains('wakaf') || lower.contains('zawa')) {
      return const BidangMeta(
        icon: LucideIcons.coins,
        shortName: 'Zakat & Wakaf',
      );
    }
    if (lower.contains('hindu')) {
      return const BidangMeta(
        icon: LucideIcons.landmark,
        shortName: 'Penyelenggara Hindu',
      );
    }
    if (lower.contains('kristen') || lower.contains('katolik')) {
      return const BidangMeta(
        icon: LucideIcons.landmark,
        shortName: 'Bimas Kristen & Katolik',
      );
    }
    return const BidangMeta(
      icon: LucideIcons.layers,
      shortName: 'Layanan Publik',
    );
  }
}

/// Helper metadata untuk layanan kepegawaian ASN (sesuai web portal)
class AsnMeta {
  final IconData icon;
  final String category;
  final Color categoryColor;
  final Color categoryBg;
  final String sla;

  const AsnMeta({
    required this.icon,
    required this.category,
    this.categoryColor = const Color(0xFF334155),
    this.categoryBg = const Color(0xFFF1F5F9),
    required this.sla,
  });

  static AsnMeta get(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('cuti')) {
      return const AsnMeta(
        icon: LucideIcons.calendarClock,
        category: 'Cuti & Izin',
        categoryColor: Color(0xFF047857),
        categoryBg: Color(0xFFECFDF5),
        sla: '1 - 2 Hari Kerja',
      );
    }
    if (lower.contains('pensiun')) {
      return const AsnMeta(
        icon: LucideIcons.userCheck,
        category: 'Kesejahteraan',
        categoryColor: Color(0xFF334155),
        categoryBg: Color(0xFFF1F5F9),
        sla: '3 - 7 Hari Kerja',
      );
    }
    if (lower.contains('mutasi')) {
      return const AsnMeta(
        icon: LucideIcons.arrowRightLeft,
        category: 'Karier & Mutasi',
        categoryColor: Color(0xFF334155),
        categoryBg: Color(0xFFF1F5F9),
        sla: '5 - 14 Hari Kerja',
      );
    }
    if (lower.contains('gaji') || lower.contains('kgb')) {
      return const AsnMeta(
        icon: LucideIcons.coins,
        category: 'Kesejahteraan',
        categoryColor: Color(0xFF334155),
        categoryBg: Color(0xFFF1F5F9),
        sla: '2 - 3 Hari Kerja',
      );
    }
    if (lower.contains('belajar')) {
      return const AsnMeta(
        icon: LucideIcons.graduationCap,
        category: 'Pengembangan Diri',
        categoryColor: Color(0xFF334155),
        categoryBg: Color(0xFFF1F5F9),
        sla: '3 - 5 Hari Kerja',
      );
    }
    if (lower.contains('pangkat')) {
      return const AsnMeta(
        icon: LucideIcons.award,
        category: 'Karier & Mutasi',
        categoryColor: Color(0xFF334155),
        categoryBg: Color(0xFFF1F5F9),
        sla: 'Sesuai Periode BKN',
      );
    }
    if (lower.contains('pemberhentian') || lower.contains('pengunduran')) {
      return const AsnMeta(
        icon: LucideIcons.logOut,
        category: 'Administrasi ASN',
        categoryColor: Color(0xFF475569),
        categoryBg: Color(0xFFF1F5F9),
        sla: '3 - 7 Hari Kerja',
      );
    }
    if (lower.contains('kp4') || lower.contains('tunjangan')) {
      return const AsnMeta(
        icon: LucideIcons.users,
        category: 'Kesejahteraan',
        categoryColor: Color(0xFF334155),
        categoryBg: Color(0xFFF1F5F9),
        sla: '1 - 3 Hari Kerja',
      );
    }
    return const AsnMeta(
      icon: LucideIcons.briefcase,
      category: 'Administrasi ASN',
      categoryColor: Color(0xFF475569),
      categoryBg: Color(0xFFF1F5F9),
      sla: '1 - 3 Hari Kerja',
    );
  }
}

/// Kartu Bidang / Seksi Unit Kerja untuk Layanan Masyarakat
class BidangCard extends StatelessWidget {
  final ServiceModel service;
  final VoidCallback onTap;

  const BidangCard({
    super.key,
    required this.service,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final meta = BidangMeta.get(service.name);
    final totalSubItems = service.items.length;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top: Icon Resmi Netral + Unit Name + Badge Total
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Center(
                        child: Icon(meta.icon, color: AppColors.primary, size: 20),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            service.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              height: 1.25,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            meta.shortName,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primaryMedium,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(LucideIcons.layers, size: 12, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            '$totalSubItems Layanan',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                if (service.description != null && service.description!.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Text(
                    service.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                ],

                // Sub-items Preview (max 2 items)
                if (service.items.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFF1F5F9)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        for (int i = 0; i < (service.items.length > 2 ? 2 : service.items.length); i++)
                          Padding(
                            padding: EdgeInsets.only(bottom: i == 0 && service.items.length > 1 ? 4 : 0),
                            child: Row(
                              children: [
                                const Icon(LucideIcons.checkCircle2, size: 12, color: Color(0xFF10B981)),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    service.items[i].name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w500,
                                      color: Color(0xFF334155),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        if (service.items.length > 2) ...[
                          const SizedBox(height: 4),
                          Text(
                            '+ ${service.items.length - 2} layanan lainnya...',
                            style: const TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 12),
                // Footer: Action button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Gratis (Rp 0)',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF047857),
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          'Lihat Katalog Layanan',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(LucideIcons.arrowRight, size: 14, color: AppColors.primary),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Kartu Layanan Pegawai ASN (Sesuai Web Portal PTSP)
class AsnServiceCard extends StatelessWidget {
  final ServiceModel service;
  final VoidCallback onSyaratTap;
  final VoidCallback onAjukanTap;

  const AsnServiceCard({
    super.key,
    required this.service,
    required this.onSyaratTap,
    required this.onAjukanTap,
  });

  @override
  Widget build(BuildContext context) {
    final meta = AsnMeta.get(service.name);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row Top: Icon + Kategori Chip + Online Status
            Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Center(
                    child: Icon(meta.icon, color: AppColors.primary, size: 20),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: meta.categoryBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Text(
                          meta.category,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            color: meta.categoryColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      'Online',
                      style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 12),
            // Title
            Text(
              service.name,
              style: const TextStyle(
                fontSize: 15.5,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
                height: 1.3,
              ),
            ),

            if (service.description != null && service.description!.isNotEmpty) ...[
              const SizedBox(height: 5),
              Text(
                service.description!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
            ],

            const SizedBox(height: 12),
            // Meta Row: SLA + Biaya
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.clock, size: 13, color: Color(0xFF64748B)),
                  const SizedBox(width: 5),
                  Text(
                    meta.sla,
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF475569),
                    ),
                  ),
                  const Spacer(),
                  const Text(
                    'Gratis (Rp 0)',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF047857),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),
            // Dual Action Buttons: "Syarat & SOP" and "Ajukan Layanan"
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onSyaratTap,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      side: const BorderSide(color: Color(0xFFCBD5E1)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      backgroundColor: const Color(0xFFF8FAFC),
                    ),
                    icon: const Icon(LucideIcons.fileText, size: 14, color: Color(0xFF475569)),
                    label: const Text(
                      'Syarat & SOP',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF334155),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onAjukanTap,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    icon: const Icon(LucideIcons.arrowRight, size: 14),
                    label: const Text(
                      'Ajukan',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Fallback LayananCard untuk kompatibilitas kode lama
class LayananCard extends StatelessWidget {
  final ServiceModel layanan;
  final VoidCallback onTap;

  const LayananCard({
    super.key,
    required this.layanan,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return BidangCard(service: layanan, onTap: onTap);
  }
}
