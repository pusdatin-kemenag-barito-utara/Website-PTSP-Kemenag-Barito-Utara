import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../core/constants/app_colors.dart';

/// Navigation Shell Utama dengan Bottom Navigation Bar Material 3
class MainNavigationShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainNavigationShell({
    super.key,
    required this.navigationShell,
  });

  void _onDestinationSelected(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBarTheme(
          data: NavigationBarThemeData(
            indicatorColor: const Color(0xFFECFDF5),
            indicatorShape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: Color(0xFFA7F3D0), width: 0.8),
            ),
            labelTextStyle: WidgetStateProperty.resolveWith<TextStyle>((states) {
              if (states.contains(WidgetState.selected)) {
                return const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                );
              }
              return const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              );
            }),
          ),
          child: NavigationBar(
            selectedIndex: navigationShell.currentIndex,
            onDestinationSelected: _onDestinationSelected,
            backgroundColor: Colors.white,
            elevation: 0,
            height: 65,
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
            destinations: const [
              NavigationDestination(
                icon: Icon(LucideIcons.house, size: 20, color: AppColors.textSecondary),
                selectedIcon: Icon(LucideIcons.house, size: 20, color: AppColors.primary),
                label: 'Beranda',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.layoutGrid, size: 20, color: AppColors.textSecondary),
                selectedIcon: Icon(LucideIcons.layoutGrid, size: 20, color: AppColors.primary),
                label: 'Layanan',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.search, size: 20, color: AppColors.textSecondary),
                selectedIcon: Icon(LucideIcons.search, size: 20, color: AppColors.primary),
                label: 'Lacak',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.bookOpen, size: 20, color: AppColors.textSecondary),
                selectedIcon: Icon(LucideIcons.bookOpen, size: 20, color: AppColors.primary),
                label: 'Buku Tamu',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.user, size: 20, color: AppColors.textSecondary),
                selectedIcon: Icon(LucideIcons.user, size: 20, color: AppColors.primary),
                label: 'Akun',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
