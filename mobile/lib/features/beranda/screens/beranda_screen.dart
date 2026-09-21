import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../widgets/quick_menu_card.dart';

/// Halaman Dashboard Utama / Beranda PTSP
class BerandaScreen extends ConsumerWidget {
  const BerandaScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.asData?.value;

    return Scaffold(
      appBar: AppBar(
        title: const Text('PTSP Kemenag Barut'),
        actions: [
          IconButton(
            icon: Icon(user != null ? LucideIcons.logOut : LucideIcons.logIn, size: 20),
            onPressed: () {
              if (user != null) {
                ref.read(authStateProvider.notifier).logout();
              } else {
                context.push('/login');
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero Banner Kemenag
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user != null ? 'Selamat Datang, ${user.nama}!' : 'Selamat Datang di PTSP Digital',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    user != null
                        ? 'Role: ${user.role.toUpperCase()} ${user.isPegawai ? "(ASN)" : ""}'
                        : 'Kantor Kementerian Agama Kabupaten Barito Utara',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      children: [
                        Icon(LucideIcons.checkCircle2, color: Colors.amberAccent, size: 18),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Pelayanan Cepat, Transparan, Akuntabel, Bebas Pungli (Rp 0).',
                            style: TextStyle(color: Colors.white, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // Menu Jalan Pintas
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Layanan Utama',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 14),
                  GridView.count(
                    crossAxisCount: 3,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.85,
                    children: [
                      QuickMenuCard(
                        title: 'Katalog Layanan',
                        icon: LucideIcons.layoutGrid,
                        onTap: () => context.push('/layanan'),
                      ),
                      QuickMenuCard(
                        title: 'Lacak Berkas',
                        icon: LucideIcons.search,
                        onTap: () => context.push('/tracking'),
                      ),
                      QuickMenuCard(
                        title: 'Buku Tamu',
                        icon: LucideIcons.bookOpen,
                        onTap: () => context.push('/buku-tamu'),
                      ),
                      if (user != null && user.isPegawai)
                        QuickMenuCard(
                          title: 'Layanan Cuti',
                          icon: LucideIcons.calendar,
                          onTap: () => context.push('/pegawai/cuti'),
                        ),
                      QuickMenuCard(
                        title: user != null ? 'Profil Akun' : 'Masuk Akun',
                        icon: LucideIcons.user,
                        onTap: () => user != null ? null : context.push('/login'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
