export default function SessionScreen() {
    const { activeProfile } = useActiveProfile();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [slides, setSlides] = useState<Slide[]>([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const load = async () => {
        if (!activeProfile) return;
        const week = 1; // or get from date
        const content = await generateSessionSlides(week, activeProfile);
        setSlides(content);
        setLoading(false);
      };
      load();
    }, []);
  
    const goNext = () => {
      if (index < slides.length - 1) {
        setIndex(index + 1);
      } else {
        navigation.replace('SessionComplete');
      }
    };
  
    if (loading) {
      return <ActivityIndicator />;
    }
  
    return (
      <View style={styles.container}>
        {slides[index]?.content}
        <TouchableOpacity onPress={goNext} style={styles.nextButton}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }
  