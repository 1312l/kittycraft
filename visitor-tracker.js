// Ziyaretçi Takip Scripti - GÜVENLİ VERSİYON - FINAL
// Webhook URL'si gizli (PHP proxy kullanır)

(function() {
    // PHP proxy kullan (webhook URL'si gizli!)
    const PROXY_URL = "webhook-proxy.json";
    
    // Rate limiting - Aynı kullanıcı 5 dakikada bir bildirim gönderir
    function canTrack() {
        const lastTrack = localStorage.getItem('lastTrack');
        if (!lastTrack) return true;
        
        const now = Date.now();
        const diff = now - parseInt(lastTrack);
        const fiveMinutes = 5 * 60 * 1000;
        
        return diff > fiveMinutes;
    }
    
    function setTracked() {
        localStorage.setItem('lastTrack', Date.now().toString());
    }
    
    // Ziyaretçi bilgilerini topla
    async function trackVisitor() {
        try {
            // Rate limiting kontrolü
            if (!canTrack()) {
                console.log('⏳ Rate limit - 5 dakika sonra tekrar dene');
                return;
            }
            
            // IP adresini al
            const ipResponse = await fetch('https://api.ipify.org/?format=json');
            const ipData = await ipResponse.json();
            const ip = ipData.ip;
            
            // Konum bilgisi al (ip-api.com - ücretsiz, CORS yok)
            let geoData = {};
            try {
                const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName,isp`);
                const data = await geoResponse.json();
                console.log('📍 Konum API yanıtı:', data); // Debug için
                
                if (data.status === 'success') {
                    geoData = data;
                } else {
                    console.warn('Konum API başarısız:', data);
                }
            } catch (e) {
                console.error('Konum API hatası:', e);
            }
            
            // Tarayıcı ve cihaz bilgileri
            const userAgent = navigator.userAgent;
            const language = navigator.language;
            const screenRes = `${screen.width}x${screen.height}`;
            const timestamp = new Date().toLocaleString('tr-TR');
            
            // Discord embed mesajı
            const embed = {
                embeds: [{
                    title: "🎀 Yeni Ziyaretçi!",
                    color: 16711935,
                    fields: [
                        {
                            name: "🌐 IP Adresi",
                            value: ip,
                            inline: true
                        },
                        {
                            name: "🌍 Ülke",
                            value: geoData.country && geoData.city 
                                ? `${geoData.country} (${geoData.city})` 
                                : geoData.country || geoData.city || 'Bilinmiyor',
                            inline: true
                        },
                        {
                            name: "🖥️ Cihaz",
                            value: /Mobile|Android|iPhone/i.test(userAgent) ? '📱 Mobil' : '💻 Masaüstü',
                            inline: true
                        },
                        {
                            name: "🌍 Tarayıcı",
                            value: getBrowserName(userAgent),
                            inline: true
                        },
                        {
                            name: "🗣️ Dil",
                            value: language,
                            inline: true
                        },
                        {
                            name: "📺 Ekran",
                            value: screenRes,
                            inline: true
                        },
                        {
                            name: "🔗 Sayfa",
                            value: window.location.href,
                            inline: false
                        },
                        {
                            name: "⏰ Zaman",
                            value: timestamp,
                            inline: false
                        }
                    ],
                    footer: {
                        text: "Hello Kitty SMP Ziyaretçi Takip"
                    },
                    timestamp: new Date().toISOString()
                }]
            };
            
            // PHP proxy üzerinden Discord'a gönder
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(embed)
            });
            
            if (response.ok) {
                console.log('✅ Ziyaretçi bilgisi Discord\'a gönderildi');
                setTracked();
            } else {
                const errorText = await response.text();
                console.error('❌ Webhook hatası:', errorText);
            }
        } catch (error) {
            console.error('❌ Tracking hatası:', error);
        }
    }
    
    // Tarayıcı adını belirle
    function getBrowserName(ua) {
        // Önce Edge kontrolü (Chromium tabanlı Edge)
        if (ua.includes('Edg/index.html') || ua.includes('Edge/index.html')) return '🌊 Edge';
        // Chrome kontrolü (Edge'den sonra!)
        if (ua.includes('Chrome') && !ua.includes('Edg')) return '🌐 Chrome';
        // Firefox
        if (ua.includes('Firefox')) return '🦊 Firefox';
        // Safari (Chrome olmayan)
        if (ua.includes('Safari') && !ua.includes('Chrome')) return '🧭 Safari';
        // Opera
        if (ua.includes('Opera') || ua.includes('OPR')) return '🎭 Opera';
        return '❓ Bilinmeyen';
    }
    
    // Sayfa yüklendiğinde çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackVisitor);
    } else {
        trackVisitor();
    }
})();
