import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'navigation_shell.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/beranda/screens/beranda_screen.dart';
import '../features/buku_tamu/screens/buku_tamu_screen.dart';
import '../features/layanan/screens/layanan_detail_screen.dart';
import '../features/layanan/screens/layanan_list_screen.dart';
import '../features/pegawai/screens/cuti_screen.dart';
import '../features/tracking/screens/tracking_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

/// Konfigurasi routing GoRouter aplikasi mobile dengan StatefulShellRoute
final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  routes: [
    // Shell Route untuk 5 Tab Utama (Persistent Bottom Navigation)
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return MainNavigationShell(navigationShell: navigationShell);
      },
      branches: [
        // Tab 1: Beranda
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/',
              builder: (context, state) => const BerandaScreen(),
            ),
          ],
        ),

        // Tab 2: Katalog Layanan
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/layanan',
              builder: (context, state) {
                final tabParam = state.uri.queryParameters['tab'];
                int initialTab = 0;
                if (tabParam == 'asn' || tabParam == 'pegawai' || tabParam == '1') {
                  initialTab = 1;
                }
                return LayananListScreen(initialTab: initialTab);
              },
              routes: [
                GoRoute(
                  path: ':slug',
                  builder: (context, state) {
                    final slug = state.pathParameters['slug'] ?? '';
                    return LayananDetailScreen(slug: slug);
                  },
                ),
              ],
            ),
          ],
        ),

        // Tab 3: Lacak Berkas
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/tracking',
              builder: (context, state) {
                final tabParam = state.uri.queryParameters['tab'];
                int initialTab = 0;
                if (tabParam == 'cuti' || tabParam == 'asn' || tabParam == '1') {
                  initialTab = 1;
                }
                return TrackingScreen(initialTab: initialTab);
              },
            ),
          ],
        ),

        // Tab 4: Buku Tamu & Janji Temu
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/buku-tamu',
              builder: (context, state) => const BukuTamuScreen(),
            ),
          ],
        ),

        // Tab 5: Akun & Masuk
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/login',
              builder: (context, state) => const LoginScreen(),
            ),
          ],
        ),
      ],
    ),

    // Standalone Route di luar shell (Full Screen Modals / Layanan Mandiri)
    GoRoute(
      parentNavigatorKey: _rootNavigatorKey,
      path: '/pegawai/cuti',
      builder: (context, state) => const CutiScreen(),
    ),
  ],
);
