-- GONICEON - Supabase Setup SQL
-- Bu kodu Supabase Dashboard > SQL Editor kısmına yapıştırıp çalıştırın (RUN).

-- Önceki tablo kalıntılarını temizle (Çakışmaları önlemek için)
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;

-- 1. Projeler Tablosu (projects)
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    impact_html TEXT,
    tags TEXT[] DEFAULT '{}',
    highlights JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'done',
    icon TEXT,
    url_text TEXT,
    internal_id TEXT,
    order_index INTEGER DEFAULT 0
);

-- Projeler için anonim okuma izni
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projeleri herkes okuyabilir" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Sadece admin ekleyebilir" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Sadece admin güncelleyebilir" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Sadece admin silebilir" ON public.projects FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Hizmetler Tablosu (services)
CREATE TABLE public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_popular BOOLEAN DEFAULT false,
    is_whatsapp BOOLEAN DEFAULT false,
    features TEXT[] DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    width_class TEXT DEFAULT ''
);

-- Hizmetler için anonim okuma izni
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hizmetleri herkes okuyabilir" ON public.services FOR SELECT USING (true);
CREATE POLICY "Sadece admin ekleyebilir" ON public.services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Sadece admin güncelleyebilir" ON public.services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Sadece admin silebilir" ON public.services FOR DELETE USING (auth.role() = 'authenticated');

-- ==========================================
-- ÖRNEK VERİLERİN (GERÇEK VERİLER) EKLENMESİ
-- ==========================================

-- Projeleri Ekle
INSERT INTO public.projects (title, type, description, impact_html, tags, highlights, status, icon, url_text, internal_id, order_index) VALUES
('MEDEK — Süreç Yönetim & Sınav Analiz Sistemi', 'Kurumsal SaaS', 'Meslek yüksekokulları için Bologna veri çekimi, soru bazlı not girişi ve otomatik MEDEK raporlama sistemi.', '<strong>Her dönem 50+ sayfalık</strong> manuel doldurmayı 15 dakikaya indirdik.', ARRAY['Python', 'Supabase', 'PostgreSQL', 'RLS', 'Web Scraping'], '[{"text": "Otomatik Bologna veri çekimi", "wip": false}, {"text": "Soru bazlı not girişi", "wip": false}, {"text": "Otomatik MEDEK raporu üretimi", "wip": false}, {"text": "Rol bazlı erişim kontrolü", "wip": false}]'::jsonb, 'done', '🎓', './medek_system_v1.0', 'proj-medek', 1),
('Kafe QR — Dijital Menü & Yönetim Sistemi', 'Restoran Yazılımı', 'Kafeler için QR tabanlı dijital menü. Gerçek zamanlı güncelleme, çift dil desteği ve admin paneli.', 'Kağıt menüyü kaldırdık. <strong>QR tara, menüyü gör</strong> — Türkçe veya İngilizce.', ARRAY['HTML/CSS/JS', 'Supabase', 'QR Kodu', 'Çok Dilli'], '[{"text": "QR kod ile anında erişim", "wip": false}, {"text": "Çift dil desteği (TR/EN)", "wip": false}, {"text": "Gerçek zamanlı ürün güncelleme", "wip": false}, {"text": "Görsel medya yönetimi", "wip": false}]'::jsonb, 'done', '☕', './kafe_qr_menu', 'proj-kafe', 2),
('AutoGuard — Otonom AI Güvenlik Sistemi', 'Yapay Zeka', 'RTX 5070 Ti tabanlı, TensorRT optimize güvenlik kamerası sistemi. YOLO ile gerçek zamanlı tespit, otomatik kayıt.', '', ARRAY['Python', 'YOLO', 'TensorRT', 'AI/ML', 'GPU'], '[{"text": "Gerçek zamanlı nesne tespiti", "wip": false}, {"text": "GPU optimizasyonu (RTX 5070 Ti)", "wip": false}, {"text": "Otomatik olay video kaydı", "wip": false}, {"text": "AI tehdit analizi (geliştiriliyor)", "wip": true}]'::jsonb, 'wip', '🛡️', './autoguard_ai_v2', 'proj-guard', 3),
('Sedirkon Mobilya — Dijital Katalog', 'Kurumsal E-Katalog', 'Sedirkon firması için tasarlanmış, ağır PDF dosyalarının yerini alan; yüksek çözünürlüklü 3D render görselleriyle donatılmış, çift dilli (TR/EN) dijital mobilya kataloğu.', 'Müşterilerin PDF bekleme süresini sıfıra indirdik. <strong>Yüksek performanslı</strong> bir vitrin oluşturduk.', ARRAY['HTML/CSS/JS', 'Responsive', 'Çok Dilli (TR/EN)'], '[{"text": "12 sayfalık dinamik sayfalama", "wip": false}, {"text": "Kusursuz çift dil (TR/EN) desteği", "wip": false}, {"text": "Masaüstü (Desktop Only) Deneyim", "wip": false}]'::jsonb, 'done', '🛋️', './sedirkon_katalog', 'proj-sedirkon', 4);

-- Hizmetleri Ekle
INSERT INTO public.services (title, description, icon, is_popular, is_whatsapp, features, order_index, width_class) VALUES
('Web Uygulaması', 'Admin paneli, SaaS, müşteri portalı — hangisi gerekiyorsa onu yapıyoruz. Supabase + vanilla HTML/JS veya tam bir backend.', '🌐', true, false, ARRAY['Supabase + RLS ile güvenli backend', 'Admin paneli & müşteri portalı', 'Gerçek zamanlı veri güncelleme'], 1, 'bc-w3'),
('Discord Bot', 'Basit komuttan tam otomasyon sistemine kadar. Sunucunuza özel komutlar, moderasyon ve AI entegrasyonu.', '🎮', false, false, ARRAY['Özel komut sistemi', 'Otomatik moderasyon', 'Rol yönetimi & bildirimler', 'AI sohbet entegrasyonu'], 2, 'bc-w2'),
('Yapay Zeka', 'YOLO nesne tespiti, GPT sohbet botu veya veri tabanlı tahmin modeli. YZ''yi projenize entegre ediyoruz.', '🤖', false, false, ARRAY['Nesne tespiti (YOLO/TensorRT)', 'AI destekli karar destek'], 3, ''),
('Kurumsal Yazılım', 'Kendi yazılımınız olsun mu? Anlık raporlar, süreç yönetimi, kullanıcı yetkilendirme.', '🏢', true, false, ARRAY['Süreç otomasyonu & raporlama', 'Rol bazlı erişim kontrolü (RLS)'], 4, 'bc-w2'),
('Veri & Analiz', 'PostgreSQL + Supabase ile güvenli veri altyapısı. Ham veriyi rapor ve grafiğe dönüştürüyoruz.', '📊', false, false, ARRAY['Veritabanı tasarımı & RLS', 'Otomatik raporlama'], 5, ''),
('Dijital Menü & QR', 'Restoran ve kafe için QR menü sistemi. Türkçe/İngilizce, gerçek zamanlı güncelleme, admin paneli dahil.', '📱', false, false, ARRAY['QR kod entegrasyonu', 'Çift dil (TR/EN) desteği'], 6, ''),
('WhatsApp Botu', 'Müşterileriniz sizi WhatsApp''tan arıyor — sipariş takibi, randevu, bildirim, hepsi otomatik.', '💬', false, true, ARRAY['7/24 otomatik yanıt sistemi', 'Sipariş & randevu yönetimi', 'Toplu mesaj & CRM entegrasyonu'], 7, 'bc-w2'),
('E-Katalog Sistemleri', 'Fiziksel broşürleri veya hantal PDF''leri dijitale taşıyoruz. Yüksek performanslı, çok dilli ve modern kataloglar hazırlıyoruz.', '🛋️', false, false, ARRAY['Anında açılan sayfalar (Sıfır yükleme süresi)', 'Çift dil desteği (TR/EN)'], 8, 'bc-w2');

-- ==========================================
-- 3. Mesajlar Tablosu (messages)
-- (Yeni Supabase projesine geçildiği için iletişim formunun çalışması için bu tablo gereklidir)
-- ==========================================
DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL
);

-- Mesajlar için yetki (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Herkes (anonim) dışarıdan mesaj GÖNDEREBİLİR (insert)
CREATE POLICY "Herkes mesaj gönderebilir" ON public.messages FOR INSERT WITH CHECK (true);

-- Ancak sadece admin olan kişi gelen mesajları GÖREBİLİR (select), GÜNCELLEYEBİLİR (update) veya SİLEBİLİR (delete)
CREATE POLICY "Sadece admin mesajları okuyabilir" ON public.messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Sadece admin mesajları silebilir" ON public.messages FOR DELETE USING (auth.role() = 'authenticated');

-- ==========================================
-- 4. Site İçerikleri Tablosu (site_content)
-- Hakkımızda bölümü vs. için key-value yapı
-- ==========================================
DROP TABLE IF EXISTS public.site_content CASCADE;

CREATE TABLE public.site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_key TEXT UNIQUE NOT NULL,
    content_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes site içeriğini okuyabilir" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Sadece admin ekleyebilir" ON public.site_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Sadece admin güncelleyebilir" ON public.site_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Sadece admin silebilir" ON public.site_content FOR DELETE USING (auth.role() = 'authenticated');

-- Varsayılan hakkımızda verileri
INSERT INTO public.site_content (content_key, content_value) VALUES
('about_p1', 'Projelerin teknik süreçlerini baştan sona üstleniyor; analiz, mimari tasarım, geliştirme ve yayınlama aşamalarını uzman ekibimizle yönetiyoruz.'),
('about_p2', 'Her projede bir proje sorumlusu, bir geliştirici ve bir kalite kontrol süreciyle çalışıyoruz — net iletişim, şeffaf ilerleme ve zamanında teslimat.'),
('about_p3', 'Amacımız sadece çalışan bir yazılım teslim etmek değil; iş akışlarınızı hızlandıran, performanslı ve uzun vadeli sürdürülebilir dijital ürünler ortaya koymak.'),
('about_focus_desc', 'Yüksek performanslı web uygulamaları, kurumsal yazılımlar ve otonom sistemler üzerine uzmanlaşmış ekibimizle çalışıyoruz. Modern mimariler ve sürdürülebilir altyapılar kuruyoruz.'),
('about_years', '3+'),
('about_projects_count', '10+'),
('about_lines', '∞');

-- ==========================================
-- 5. Duyurular Tablosu (announcements)
-- Sitede ziyaretçilere popup olarak gösterilir
-- ==========================================
DROP TABLE IF EXISTS public.announcements CASCADE;

CREATE TABLE public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    badge_text TEXT DEFAULT '📢 Duyuru',
    btn_text TEXT DEFAULT 'Anladım',
    btn_url TEXT DEFAULT ''
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes aktif duyuruları okuyabilir" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Sadece admin duyuru ekleyebilir" ON public.announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Sadece admin duyuru güncelleyebilir" ON public.announcements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Sadece admin duyuru silebilir" ON public.announcements FOR DELETE USING (auth.role() = 'authenticated');
