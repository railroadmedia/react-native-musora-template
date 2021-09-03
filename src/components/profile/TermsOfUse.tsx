import React, { useContext, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, View, Linking } from 'react-native';
import { ThemeContext } from '../../state/theme/ThemeContext';
import { utils } from '../../utils';
import { themeStyles } from '../../themeStyles';

interface Props {
  from?: string;
}

export const TermsOfUse: React.FC<Props> = ({ from }) => {
  const { theme } = useContext(ThemeContext);

  let styles = setStyles(theme);
  useEffect(() => {
    styles = setStyles(theme);
  }, [theme]);

  return (
    <View style={styles.container}>
      <ScrollView style={{ marginLeft: 15, paddingRight: 15 }}>
        {!from && <Text style={styles.pageTitle}>Terms of Use</Text>}
        <Text
          style={[
            styles.text,
            {
              textAlign: 'center'
            }
          ]}
        >
          Last updated: September 2020
        </Text>
        <Text style={styles.text}>
          Welcome to the Musora community! We are excited to help you on your
          musical journey. {`\n\n`}
          Please read these Terms of Use ("Terms", "Terms of Use") carefully
          before using the {`www.${utils.brand}.com`} website and/or the{' '}
          {`${utils.brand}`} mobile application (the "Service") operated by
          Musora Media Inc., (“Musora”, “us”, "we", or "our"). {`\n\n`}
          Your access to and use of the Service is conditioned upon your
          acceptance of and compliance with these Terms. These Terms apply to
          all visitors, users and others who wish to access or use the Service
          either through the website or mobile application. We want you to have
          an enjoyable, educational experience using the Service, so we offer a
          90-day Money Back Guarantee on all purchases made through the Service.
          {`\n\n`}
          By accessing or using the Service you agree to be bound by these
          Terms. If you disagree with any part of the terms then you do not have
          permission to access the Service. If you are using the Services
          through the mobile application, you are also bound by the terms and
          conditions found in either Apple’s Media Services Terms and Conditions
          (apple.com/legal/internet-services/itunes/us/terms.html) or Google
          Play’s Terms of Service
          (play.google.com/intl/en-us_us/about/play-terms/index.html) depending
          on the type of device you are using.
        </Text>
        <Text style={styles.boldText}>Eligibility</Text>
        <Text style={styles.text}>
          To be eligible to subscribe to the Service, you must be at least
          eighteen (18) years old, or above the age of majority in your
          jurisdiction, and fill out the information necessary to create a
          profile. You agree to provide true, accurate, current, and complete
          information about yourself as prompted by the Service registration
          process. You are responsible for your own personal account activity,
          and you agree to notify Musora if you suspect any unauthorized
          activity. {`\n\n`}
          By signing up for a subscription to the Service, you agree to pay the
          listed price at the chosen interval indefinitely until you contact us,
          OR use the provided tools to cancel your chosen subscription. To
          request a refund please contact {`support@${utils.brand}.com`}. If
          your subscription goes beyond our 90-Day Money Back Guarantee period,
          then your subscription will terminate at the end of your paid billing
          cycle. Once you choose to cancel your subscription, you will continue
          to have access to your subscription portion of the Service until the
          end of your paid billing cycle.
        </Text>
        <Text style={[styles.text, { color: '#85200c' }]}>
          By signing up for a Lifetime Membership to the Service you agree to
          pay the listed price in full. As a Lifetime Member you have the right
          to use the Service under these Terms, as long as the Service is
          available. If at any time the Service will permanently cease to be
          available we will, to the best of our ability and in a reasonable time
          frame, provide you the means necessary to download the material
          available on the Service, in whole, or in part, before the Service is
          terminated. To request a refund please contact{' '}
          {`support@${utils.brand}.com`}
          within 90 days of your purchase. Once the initial 90 day period has
          expired, your Lifetime Membership is valid for the life of the Service
          and will remain in effect for as long as the Service is available.
        </Text>
        <Text style={styles.text}>
          That said, all purchases made through Apple App Store or Google Play
          Store are subject to their return policies. For more information,
          contact us at {`support@${utils.brand}.com`} and we are happy to help
          you out.
        </Text>
        <Text style={styles.boldText}>License to Use Services</Text>
        <Text style={styles.text}>
          Upon successful registration, you are granted a personal use license
          subject to the following conditions.{`\n`}
          You may not: {`\n`}
          {`  1) Sell, rent, or sub-license any material from the Services;`}
          {`\n`}
          {`  2) Re-publish material from the Services (including republication on another website);`}{' '}
          {`\n`}
          {`  3) Redistribute material from the Services (except for content specifically and expressly made available for redistribution);`}
          {`\n`}
          {`  4) Reproduce, duplicate, copy, or otherwise exploit material from the Services for any commercial purpose;`}{' '}
          {`\n`}
          {`  5) Edit or otherwise modify any material on the website; or`}
          {`\n`}
          {`  6) Show any material from the Services in public.`}
          {`\n\n`}
          As part of the Service, you are encouraged to record yourself playing
          along to tracks accessed through the subscription portion of the
          Service. If you upload any such video to a video hosting website (i.e.
          YouTube) we ask that you give accurate credit and not monetize the
          video. We reserve all rights to any and all original compositions
          found in the Service.
        </Text>
        <Text style={styles.boldText}>User Contributions</Text>
        <Text style={styles.text}>
          Users who post materials to the Service (e.g. bulletin boards, comment
          feeds, etc.) agree to abide by the following rules: 1) users may not
          post or transmit material that is libelous, defamatory, obscene,
          fraudulent, harmful, threatening, abusive or hateful, that violates
          the property rights of others (including without limitation, the
          infringement of copyright, trademark, or other intellectual property
          rights), that violates the privacy or publicity right of others, or
          that is in violation of applicable laws; {`2) `} users may not
          interfere with other user’s use and enjoyment of the Service; {`3) `}
          users may not use this site to conduct any activity that is illegal or
          that violates the rights of others; {`4) `} users may not use this
          site to advertise or sell products or services to others; and {`5) `}
          users must immediately inform Musora if they have reason to believe
          that a user is infringing any copyrighted materials. A user posting
          material represents that such material is unique to the user or used
          with permission of the copyright holder, and for valuable
          consideration, the receipt and sufficiency is hereby acknowledged,
          assigns to Musora the worldwide, perpetual, fully-paid, royalty-free,
          sub-licensable right to use, publish, broadcast, post online, and
          copyright such material. Musora has no responsibility for the content
          of any material posted by users, but Musora reserves the right in its
          sole discretion to (i) edit or delete any posts, videos, comments,
          information, or other such material submitted to or appearing on this
          site, and (ii) refuse access to the site to any user that violates
          this agreement. Bulletin boards, forums, message boards, and chat
          rooms contain the opinions and views of other users, and Musora is not
          responsible for the accuracy of the views and opinions expressed
          thereon
        </Text>
        <Text style={styles.boldText}>Intellectual Property</Text>
        <Text style={styles.text}>
          The Service and its original content, features and functionality are
          and will remain the exclusive property of Musora and its licensors.
          The Service is protected by copyright, trademark, and other laws of
          Canada, the United States and foreign countries. Our trademarks and
          trade dress may not be used in connection with any product or service
          without the prior written consent of Musora.{`\n\n`}
          The use of this website’s content by you is strictly prohibited unless
          specifically permitted by these Terms of Use. Any unauthorized use may
          violate the copyright, trademark, and other proprietary rights of
          Musora and/or third parties, as well as the laws of privacy and
          publicity, and other regulations and statutes. Nothing contained in
          this Agreement or in the Site shall be construed as granting, by
          implication or otherwise, any license or right to use any Trademark or
          other proprietary information without the express written consent of
          Musora or third-party owner.{`\n\n`}
          We respect the copyright, trademark and all other intellectual
          property rights of others. We have the right, but not the obligation,
          to remove content and accounts containing materials that we deem, in
          our sole discretion, to be unlawful, offensive, threatening, libelous,
          defamatory, pornographic, obscene or otherwise objectionable or
          violates any party’s intellectual property or these Terms of Use.
          {`\n\n`}
          If you believe that your intellectual property rights are being
          violated and/or that any work belonging to you has been reproduced on
          the Site or in any content in any way, you may notify us at
          {`support@${utils.brand}.com`} Please provide your name and contact
          information, the nature of your work and how it is being violated, all
          relevant copyright and/or trademark registration information, the
          location/URL of the violation, and any other information you believe
          is relevant.
        </Text>
        <Text style={styles.boldText}>Links to Other Websites</Text>
        <Text style={styles.text}>
          Our Service may contain links to third party web sites or services
          that are not owned or controlled by us for convenience to you.{`\n\n`}
          We have no control over, and assume no responsibility for the content,
          privacy policies, or practices of any third-party web sites or
          services. We do not warrant the offerings of any of these
          entities/individuals or their websites and you access and use such
          sites, including information, material, products and services therein,
          solely at your own risk.{`\n\n`}
          You acknowledge and agree that Musora shall not be responsible or
          liable, directly or indirectly, for any damage or loss caused or
          alleged to be caused by or in connection with use of or reliance on
          any such content, goods or services available on or through any such
          third-party web sites or services.{`\n\n`}
          We strongly advise you to read the terms and conditions and privacy
          policies of any third-party web sites or services that you visit.
        </Text>
        <Text style={styles.boldText}>Termination</Text>
        <Text style={styles.text}>
          We may terminate or suspend your access to the Service immediately,
          without prior notice or liability, under our sole discretion, for any
          reason whatsoever and without limitation, including but not limited to
          a breach of the Terms.{`\n\n`}
          All provisions of the Terms which by their nature should survive
          termination shall survive termination, including, without limitation,
          ownership provisions, warranty disclaimers, indemnity and limitations
          of liability.
        </Text>
        <Text style={styles.boldText}>Indemnification</Text>
        <Text style={styles.text}>
          You agree to defend, indemnify and hold harmless Murora and its
          licensee and licensors, and their employees, contractors, agents,
          officers and directors, from and against any and all claims, damages,
          obligations, losses, liabilities, costs or debt, and expenses
          (including but not limited to attorney's fees), resulting from or
          arising out of {`a)`} your use and access of the Service, or {`b)`} a
          breach of these Terms.
        </Text>
        <Text style={styles.boldText}>Limitation Of Liability</Text>
        <Text style={styles.text}>
          In no event shall Musora Media, Inc, nor its directors, employees,
          partners, agents, suppliers, or affiliates, be liable for any
          indirect, incidental, special, consequential or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or
          other intangible losses, resulting from (i) your access to or use of
          or inability to access or use the Service; (ii) any conduct or content
          of any third party on the Service; (iii) any content obtained from the
          Service; and (iv) unauthorized access, use or alteration of your
          transmissions or content, whether based on warranty, contract, tort
          (including negligence) or any other legal theory, whether or not we
          have been informed of the possibility of such damage, and even if a
          remedy set forth herein is found to have failed of its essential
          purpose.
        </Text>
        <Text style={styles.boldText}>Disclaimer</Text>
        <Text style={styles.text}>
          Your use of the Service is at your sole risk. The Service is provided
          on an "AS IS" and "AS AVAILABLE" basis. The Service is provided
          without warranties of any kind, whether express or implied, including,
          but not limited to, implied warranties of merchantability, fitness for
          a particular purpose, non- infringement or course of performance.
          {'\n\n'}
          Musora its subsidiaries, affiliates, and its licensors do not warrant
          that {`a)`} the Service will function uninterrupted, secure or
          available at any particular time or location;{`b)`} any errors or
          defects will be corrected; {`c)`} the Service is free of viruses or
          other harmful components; or {`d)`} the results of using the Service
          will meet your requirements.
          {'\n\n'}
          All information (including without limitation, advice,
          recommendations, and tips) on the Services are intended solely as a
          general educational aid. Musora and its agents assume no
          responsibility or liability for any consequence relating directly or
          indirectly to any action or inaction you take based on the
          information, services, tips, recommendations, or materials on the
          Services.
        </Text>
        <Text style={styles.boldText}>Exclusions</Text>
        <Text style={styles.text}>
          Some jurisdictions do not allow the exclusion of certain warranties or
          the exclusion or limitation of liability for consequential or
          incidental damages, so the limitations above may not apply to you.
        </Text>
        <Text style={styles.boldText}>Governing Law</Text>
        <Text style={styles.text}>
          These Terms shall be governed and construed in accordance with the
          laws of British Columbia and the laws of Canada applicable therein.
          {`\n\n`}
          Our failure to enforce any right or provision of these Terms will not
          be considered a waiver of those rights. If any provision of these
          Terms is held to be invalid or unenforceable by a court, the remaining
          provisions of these Terms will remain in effect. These Terms
          constitute the entire agreement between us regarding our Service, and
          supersede and replace any prior agreements we might have had between
          us regarding the Service.
        </Text>
        <Text style={styles.boldText}>Changes</Text>
        <Text style={styles.text}>
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time. If a revision is material, we will provide at
          least 30 days’ notice prior to any new terms taking effect. What
          constitutes a material change will be determined at our sole
          discretion. We will do our best to keep you updated if there are any
          material changes made from third-party services being utilized by the
          Service.{`\n\n`}
          By continuing to access or use our Service after any revisions become
          effective, you agree to be bound by the revised terms. If you do not
          agree to the new terms, you are no longer authorized to use the
          Service.
        </Text>
        <Text style={styles.boldText}>Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions about these Terms, please contact us:{' '}
          {`support@${utils.brand}.com`}
        </Text>
      </ScrollView>
    </View>
  );
};

const setStyles = (theme: string, current = themeStyles[theme]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: current.background
    },
    title: {
      marginTop: 20,
      marginBottom: 10
    },
    text: {
      color: current.textColor,
      fontFamily: 'OpenSans',
      fontSize: utils.figmaFontSizeScaler(12),
      marginBottom: 10
    },
    boldText: {
      color: current.textColor,
      fontFamily: 'OpenSans-Bold',
      fontSize: utils.figmaFontSizeScaler(16),
      marginBottom: 10
    },
    pageTitle: {
      fontSize: utils.figmaFontSizeScaler(30),
      fontFamily: 'OpenSans-Bold',
      marginTop: 20,
      marginBottom: 10,
      textAlign: 'center',
      color: current.textColor
    }
  });
