'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<'en' | 'ur'>(getStoredLanguage);

  const sections = [
    {
      title: { en: 'Information We Collect', ur: 'ہم جو معلومات جمع کرتے ہیں' },
      content: {
        en: 'We collect information you provide directly to us, including your name, email address, phone number, and any complaints or issues you report through our platform. We also automatically collect certain information about your device and usage of our services.',
        ur: 'ہم وہ معلومات جمع کرتے ہیں جو آپ ہمیں براہ راست فراہم کرتے ہیں، بشمول آپ کا نام، ای میل ایڈریس، فون نمبر، اور کوئی بھی شکایات یا مسائل جو آپ ہمارے پلیٹ فارم کے ذریعے رپورٹ کرتے ہیں۔ ہم خود بخود آپ کے ڈیوائس اور ہماری خدمات کے استعمال کے بارے میں کچھ معلومات بھی جمع کرتے ہیں۔'
      }
    },
    {
      title: { en: 'How We Use Your Information', ur: 'ہم آپ کی معلومات کا استعمال کیسے کرتے ہیں' },
      content: {
        en: 'We use the information we collect to provide, maintain, and improve our services, to process your complaints and connect you with relevant government departments, to send you technical notices and support messages, and to respond to your comments and questions.',
        ur: 'ہم جمع کی گئی معلومات کا استعمال اپنی خدمات فراہم کرنے، برقرار رکھنے اور بہتر بنانے، آپ کی شکایات پر کارروائی کرنے اور آپ کو متعلقہ سرکاری محکموں سے جوڑنے، تکنیکی نوٹس اور سپورٹ پیغامات بھیجنے، اور آپ کے تبصروں اور سوالات کا جواب دینے کے لیے کرتے ہیں۔'
      }
    },
    {
      title: { en: 'Information Sharing', ur: 'معلومات کا اشتراک' },
      content: {
        en: 'We share your information with relevant government departments and organizations to resolve your reported issues. We may also share information with service providers who help us operate our platform. We do not sell your personal information to third parties.',
        ur: 'ہم آپ کی معلومات متعلقہ سرکاری محکموں اور تنظیموں کے ساتھ آپ کے رپورٹ کردہ مسائل کو حل کرنے کے لیے شیئر کرتے ہیں۔ ہم سروس فراہم کنندگان کے ساتھ بھی معلومات شیئر کر سکتے ہیں جو ہمیں ہمارا پلیٹ فارم چلانے میں مدد کرتے ہیں۔ ہم آپ کی ذاتی معلومات تیسرے فریق کو نہیں بیچتے۔'
      }
    },
    {
      title: { en: 'Data Security', ur: 'ڈیٹا کی حفاظت' },
      content: {
        en: 'We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. All data is transmitted securely using encryption.',
        ur: 'ہم آپ کی ذاتی معلومات کو نقصان، چوری، غلط استعمال، غیر مجاز رسائی، انکشاف، ترمیم، اور تباہی سے بچانے کے لیے معقول اقدامات کرتے ہیں۔ تمام ڈیٹا خفیہ کاری کا استعمال کرتے ہوئے محفوظ طریقے سے منتقل کیا جاتا ہے۔'
      }
    },
    {
      title: { en: 'Your Rights', ur: 'آپ کے حقوق' },
      content: {
        en: 'You have the right to access, update, or delete your personal information at any time through your account settings. You can also request that we delete your account and all associated data by contacting us.',
        ur: 'آپ کو کسی بھی وقت اپنی ذاتی معلومات تک رسائی، اپ ڈیٹ، یا حذف کرنے کا حق حاصل ہے۔ آپ ہم سے رابطہ کرکے اپنا اکاؤنٹ اور تمام متعلقہ ڈیٹا حذف کرنے کی درخواست بھی کر سکتے ہیں۔'
      }
    },
    {
      title: { en: 'Contact Us', ur: 'ہم سے رابطہ کریں' },
      content: {
        en: 'If you have any questions about this Privacy Policy, please contact us at privacy@civicai.pk or through our platform\'s support channel.',
        ur: 'اگر آپ کے پاس اس رازداری کی پالیسی کے بارے میں کوئی سوالات ہیں، تو براہ کرم ہم سے privacy@civicai.pk پر یا ہمارے پلیٹ فارم کے سپورٹ چینل کے ذریعے رابطہ کریں۔'
      }
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ScrollReveal animation="animate-slide-up">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-gradient-primary mb-4">
                {t({ en: 'Privacy Policy', ur: 'رازداری کی پالیسی' }, language)}
              </h1>
              <p className="text-neutral-500 text-lg">
                {t({ en: 'Last updated: September 2026', ur: 'آخری اپ ڈیٹ: ستمبر 2026' }, language)}
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <ScrollReveal key={index} animation="animate-slide-up" delay={index * 80}>
                <div className="card p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center text-white font-bold shadow-lg shadow-secondary-500/20 shrink-0">
                      {index + 1}
                    </span>
                    {t(section.title, language)}
                  </h2>
                  <p className="text-neutral-600 leading-relaxed text-base pl-13 ml-[52px]">
                    {t(section.content, language)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
