import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/providers/core_providers.dart';
import '../models/buku_tamu_model.dart';
import '../repositories/buku_tamu_repository.dart';

final bukuTamuRepositoryProvider = Provider<BukuTamuRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return BukuTamuRepository(dioClient);
});

/// Halaman Form Pengisian Buku Tamu Elektronik
class BukuTamuScreen extends ConsumerStatefulWidget {
  const BukuTamuScreen({super.key});

  @override
  ConsumerState<BukuTamuScreen> createState() => _BukuTamuScreenState();
}

class _BukuTamuScreenState extends ConsumerState<BukuTamuScreen> {
  final _formKey = GlobalKey<FormState>();
  final _namaController = TextEditingController();
  final _instansiController = TextEditingController();
  final _teleponController = TextEditingController();
  final _keperluanController = TextEditingController();
  String _tujuanSeksi = 'Umum / PTSP';
  bool _isLoading = false;

  final List<String> _seksiOptions = [
    'Umum / PTSP',
    'Bimas Islam',
    'Pendidikan Madrasah (Penmad)',
    'Penyelenggaraan Haji & Umrah (PHU)',
    'Pendidikan Agama & Keagamaan Islam (Pakis)',
    'Subbag Tata Usaha',
  ];

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final repo = ref.read(bukuTamuRepositoryProvider);

    final success = await repo.submitBukuTamu(
      BukuTamuInput(
        namaLengkap: _namaController.text.trim(),
        instansi: _instansiController.text.trim(),
        telepon: _teleponController.text.trim(),
        keperluan: _keperluanController.text.trim(),
        tujuanSeksi: _tujuanSeksi,
      ),
    );

    setState(() => _isLoading = false);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AppColors.statusSuccess,
            content: Text('Buku tamu berhasil dicatat. Terima kasih!'),
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AppColors.statusRejected,
            content: Text('Gagal menyimpan buku tamu. Silakan coba lagi.'),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _namaController.dispose();
    _instansiController.dispose();
    _teleponController.dispose();
    _keperluanController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Buku Tamu Elektronik'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildField('Nama Lengkap', _namaController, LucideIcons.user),
              const SizedBox(height: 14),
              _buildField('Asal Instansi / Lembaga', _instansiController, LucideIcons.building),
              const SizedBox(height: 14),
              _buildField('Nomor WhatsApp / HP', _teleponController, LucideIcons.phone,
                  keyboard: TextInputType.phone),
              const SizedBox(height: 14),
              const Text('Tujuan Seksi / Layanan',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: _tujuanSeksi,
                decoration: const InputDecoration(),
                items: _seksiOptions.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _tujuanSeksi = val);
                },
              ),
              const SizedBox(height: 14),
              _buildField('Keperluan Kunjungan', _keperluanController, LucideIcons.fileText,
                  maxLines: 3),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Kirim Buku Tamu'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, IconData icon,
      {int maxLines = 1, TextInputType? keyboard}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboard,
          validator: (val) => val == null || val.trim().isEmpty ? 'Wajib diisi' : null,
          decoration: InputDecoration(
            prefixIcon: maxLines == 1 ? Icon(icon, size: 20) : null,
          ),
        ),
      ],
    );
  }
}
