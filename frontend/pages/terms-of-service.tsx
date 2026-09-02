'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function TermsOfServicePage() {
  const [language, setLanguage] = useState<'en' | 'ur'>(getStoredLanguage);

  const sections = [
    {
      title: { en: 'Acceptance of Terms', ur: 'شرائط کی قبولیت' },
      content: {
        en: 'By accessing or using CivicAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time.',
        ur: 'CivicAI تک رسائی یا استعمال کرکے، آپ ان خدمات کی شرائط سے پابند ہونے پر راضی ہوتے ہیں۔ اگر آپ ان شرائط سے متفق نہیں ہیں، تو براہ کرم ہمارا پلیٹ فارم استعمال نہ کریں۔ ہم کسی بھی وقت ان شرائط کو اپ ڈیٹ کرنے کا حق محفوظ رکھتے ہیں۔'
      }
    },
    {
      title: { en: 'Use of Services', ur: 'خدمات کا استعمال' },
      content: {
        en: 'You may use our services only for lawful purposes and in accordance with these terms. You agree not to misuse the platform, including but not limited to: submitting false complaints, attempting to gain unauthorized access, or interfering with the proper working of the service.',
        ur: 'آپ صرف قانونی مقاصد کے لیے اور ان شرائط کے مطابق ہماری خدمات استعمال کر سکتے ہیں۔ آپ پلیٹ فارم کا غلط استعمال نہ کرنے پر راضی ہیں، بشمول: جھوٹی شکایات جمع کرنا، غیر مجاز رسائی حاصل کرنے کی کوشش کرنا، یا سروس کے مناسب کام میں مداخلت کرنا۔'
      }
    },
    {
      title: { en: 'User Accounts', ur: 'صارف اکاؤنٹس' },
      content: {
        en: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
        ur: 'آپ اپنے اکاؤنٹ اور پاس ورڈ کی رازداری کو برقرار رکھنے کے ذمہ دار ہیں۔ آپ اپنے اکاؤنٹ کے تحت ہونے والی تمام سرگرمیوں کی ذمہ داری قبول کرنے پر راضی ہیں۔ آپ کو اپنے اکاؤنٹ کے کسی بھی غیر مجاز استعمال کے بارے میں فوری طور پر ہمیں مطلع کرنا ہوگا۔'
      }
    },
    {
      title: { en: 'Content and Complaints', ur: 'مواد اور شکایات' },
      content: {
        en: 'You retain ownership of any content you submit through our platform. By submitting complaints or other content, you grant us a license to use, modify, and share that content as necessary to provide our services. You are solely responsible for the accuracy of information you provide.',
        ur: 'آپ کسی بھی مواد کی ملکیت برقرار رکھتے ہیں جو آپ ہمارے پلیٹ فارم کے ذریعے جمع کرتے ہیں۔ شکایات یا دیگر مواد جمع کرکے، آپ ہمیں اپنی خدمات فراہم کرنے کے لیے ضروری کے طور پر اس مواد کو استعمال، ترمیم، اور شیئر کرنے کا لائسنس دیتے ہیں۔ آپ جو معلومات فراہم کرتے ہیں اس کی درستگی کے لیے آپ مکمل طور پر ذمہ دار ہیں۔'
      }
    },
    {
      title: { en: 'Government Departments', ur: 'سرکاری محکمے' },
      content: {
        en: 'We act as a platform to connect citizens with relevant government departments. We do not guarantee resolution of complaints or the actions taken by government departments. The resolution of issues is at the discretion of the respective authorities.',
        ur: 'ہم شہریوں کو متعلقہ سرکاری محکموں سے جوڑنے کے لیے ایک پلیٹ فارم کے طور پر کام کرتے ہیں۔ ہم شکایات کے حل یا سرکاری محکموں کی طرف سے کیے گئے اقدامات کی ضمانت نہیں دیتے۔ مسائل کا حل متعلقہ حکام کے صوابدید پر ہے۔'
      }
    },
    {
      title: { en: 'Limitation of Liability', ur: 'ذمہ داری کی حد' },
      content: {
        en: 'CivicAI is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid us, if any.',
        ur: 'CivicAI "جیسا ہے" کے طور پر فراہم کیا جاتا ہے بغیر کسی قسم کی ضمانت کے۔ ہم آپ کی خدمات کے استعمال سے پیدا ہونے والے کسی بھی بالواسطہ، اتفاقی، خاص، یا نتیجہ خیز نقصان کے لیے ذمہ دار نہیں ہوں گے۔ ہماری کل ذمہ داری اس رقم سے تجاوز نہیں کرے گی جو آپ نے ہمیں ادا کی، اگر کوئی ہو۔'
      }
    },
    {
      title: { en: 'Termination', ur: 'اختتام' },
      content: {
        en: 'We reserve the right to terminate or suspend your account at any time for violation of these terms. Upon termination, your right to use the service will immediately cease. You may delete your account at any time through your account settings.',
        ur: 'ہم ان شرائط کی خلاف ورزی کے لیے کسی بھی وقت آپ کا اکاؤنٹ ختم یا معطل کرنے کا حق محفوظ رکھتے ہیں۔ اختتام پر، سروس استعمال کرنے کا آپ کا حق فوری طور پر ختم ہو جائے گا۔ آپ اپنے اکاؤنٹ کی ترتیبات کے ذریعے کسی بھی وقت اپنا اکاؤنٹ حذف کر سکتے ہیں۔'
      }
    },
    {
      title: { en: 'Contact Information', ur: 'رابطہ کی معلومات' },
      content: {
        en: 'For any questions about these Terms of Service, please contact us at legal@civicai.pk or through our platform\'s support channel.',
        ur: 'ان خدمات کی شرائط کے بارے میں کسی بھی سوال کے لیے، براہ کرم ہم سے legal@civicai.pk پر یا ہمارے پلیٹ فارم کے سپورٹ چینل کے ذریعے رابطہ کریں۔'
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
                {t({ en: 'Terms of Service', ur: 'خدمات کی شرائط' }, language)}
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
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg shadow-secondary-500/20 shrink-0">
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
