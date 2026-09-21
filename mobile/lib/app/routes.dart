import 'package:go_router/go_router.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/beranda/screens/beranda_screen.dart';
import '../features/buku_tamu/screens/buku_tamu_screen.dart';
import '../features/layanan/screens/layanan_detail_screen.dart';
import '../features/layanan/screens/layanan_list_screen.dart';
import '../features/pegawai/screens/cuti_screen.dart';
import '../features/tracking/screens/tracking_screen.dart';

/// Konfigurasi routing GoRouter aplikasi mobile
final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const BerandaScreen(),
    ),
    GoRoute(
      path: '/layanan',
      builder: (context, state) => const LayananListScreen(),
    ),
    GoRoute(
      path: '/layanan/:slug',
      builder: (context, state) {
        final slug = state.pathParameters['slug'] ?? '';
        return LayananDetailScreen(slug: slug);
      },
    ),
    GoRoute(
      path: '/tracking',
      builder: (context, state) => const TrackingScreen(),
    ),
    GoRoute(
      path: '/buku-tamu',
      builder: (context, state) => const BukuTamuScreen(),
    ),
    GoRoute(
      path: '/pegawai/cuti',
      builder: (context, state) => const CutiScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
  ],
);
