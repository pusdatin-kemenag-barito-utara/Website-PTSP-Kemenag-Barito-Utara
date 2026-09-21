import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('PTSP App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: PtspApp(),
      ),
    );

    // Verifikasi aplikasi berhasil render judul PTSP Kemenag
    expect(find.text('PTSP Kemenag Barut'), findsOneWidget);
  });
}
