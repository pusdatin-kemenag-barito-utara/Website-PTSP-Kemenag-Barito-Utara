import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../models/tracking_model.dart';
import '../providers/tracking_provider.dart';

/// Halaman Lacak Status Permohonan PTSP
class TrackingScreen extends ConsumerStatefulWidget {
  const TrackingScreen({super.key});

  @override
  ConsumerState<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends ConsumerState<TrackingScreen> {
  final _searchController = TextEditingController();
  String _searchedNumber = '';

  void _doSearch() {
    setState(() {
      _searchedNumber = _searchController.text.trim();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final trackingAsync = _searchedNumber.isNotEmpty
        ? ref.watch(trackingResultProvider(_searchedNumber))
        : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lacak Permohonan'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Input Pencarian
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Nomor Registrasi / Tiket',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      hintText: 'Contoh: REQ-2026-XXXX',
                      prefixIcon: Icon(LucideIcons.search, size: 20),
                    ),
                    onSubmitted: (_) => _doSearch(),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _doSearch,
                      icon: const Icon(LucideIcons.search, size: 18),
                      label: const Text('Lacak Status'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Hasil Tracking
            if (trackingAsync != null)
              trackingAsync.when(
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(),
                  ),
                ),
                error: (e, s) => const Center(
                  child: Text('Gagal melakukan pencarian.'),
                ),
                data: (model) {
                  if (model == null) {
                    return _buildNotFound();
                  }
                  return _buildResultCard(model);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotFound() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.statusRejectedBg,
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Row(
        children: [
          Icon(LucideIcons.alertTriangle, color: AppColors.statusRejected),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Nomor permohonan tidak ditemukan. Mohon pastikan nomor yang Anda masukkan benar.',
              style: TextStyle(fontSize: 13, color: AppColors.statusRejected),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultCard(TrackingModel item) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                item.requestNumber,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
              _buildStatusBadge(item.status),
            ],
          ),
          const Divider(height: 24),
          _buildRow('Layanan', item.serviceName),
          const SizedBox(height: 8),
          _buildRow('Nama Pemohon', item.applicantName),
          if (item.note != null && item.note!.isNotEmpty) ...[
            const SizedBox(height: 8),
            _buildRow('Catatan Petugas', item.note!),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg = AppColors.statusPendingBg;
    Color text = AppColors.statusPending;

    if (status.toLowerCase().contains('selesai') || status.toLowerCase().contains('approved')) {
      bg = AppColors.statusSuccessBg;
      text = AppColors.statusSuccess;
    } else if (status.toLowerCase().contains('tolak') || status.toLowerCase().contains('rejected')) {
      bg = AppColors.statusRejectedBg;
      text = AppColors.statusRejected;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: text),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
